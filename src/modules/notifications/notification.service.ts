import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, NotificationTargetType, SocketEvent } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { NotificationTarget } from 'src/common/interfaces';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Notification, SystemMessage, User } from 'src/mongo-schemas';
import { SocketGateway } from '../gateway/socket.gateway';
import { SystemMessageService } from '../system-messages/system-message.service';
import { IGetNotificationListQuery } from './notification.interface';

@Injectable()
export class NotificationService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private socketGateway: SocketGateway,
        private systemMessageService: SystemMessageService,
    ) {}

    async getList(userId: string, query: IGetNotificationListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (page - 1) * +limit;

        const notifications = await this.dataServices.notifications.findAll(
            {
                to: toObjectId(userId),
            },
            {
                populate: ['author', 'target'],
                sort: [['updatedAt', -1]],
                skip: +skip,
                limit: +limit,
            },
        );
        const notificationDtos = await this.dataResources.notifications.mapToDtoList(notifications);
        return notificationDtos;
    }

    async create(
        user: Partial<User> | null,
        to: Partial<User>,
        targetType: string,
        target: NotificationTarget,
        action: string,
        additionalData?: object,
        urgent = false,
    ) {
        const createdNotification =
            targetType === NotificationTargetType.SYSTEM_MESSAGE
                ? await this.createSystemMessageNotification(to, targetType, target, action, additionalData, urgent)
                : await this.createUserNotification(user, to, targetType, target, action, urgent);
        if (!createdNotification) return;

        this.socketGateway.server.to(`${to._id}`).emit(SocketEvent.USER_NOTIFICATION, createdNotification);
        return createdNotification._id;
    }

    private async createUserNotification(
        user: Partial<User>,
        to: Partial<User>,
        targetType: string,
        target: NotificationTarget,
        action: string,
        urgent = false,
    ) {
        if (`${user._id}` == `${to._id}`) {
            return;
        }
        // check notification, if existed (ignore soft-delete) => update deletedAt or return immediately
        const existedNotification = await this.dataServices.notifications.findOne(
            {
                author: user._id,
                to: to._id,
                targetType,
                target: target._id,
                action,
            },
            {
                ignoreSoftDelete: true,
            },
        );
        if (existedNotification) {
            if (!existedNotification.deletedAt) {
                return;
            }
            await this.dataServices.notifications.updateById(existedNotification._id, {
                deletedAt: null,
            });
            return existedNotification._id;
        }

        // create notification
        const toCreateNotificationBody: Partial<Notification> = {
            author: toObjectId(user._id) as unknown,
            to: toObjectId(to._id) as unknown,
            targetType,
            target: toObjectId(target._id) as unknown,
            action,
            isRead: false,
            urgent,
        };
        return await this.dataServices.notifications.create(toCreateNotificationBody);
    }

    private async createSystemMessageNotification(
        to: Partial<User>,
        targetType: string,
        target: NotificationTarget,
        action: string,
        additionalData?: object,
        urgent = false,
    ) {
        // create notification
        const toCreateNotificationBody: Partial<Notification> = {
            author: null,
            to: toObjectId(to._id) as unknown,
            targetType,
            target: toObjectId(target._id) as unknown,
            action,
            additionalData,
            isRead: false,
            urgent,
        };
        const content = await this.systemMessageService.buildMessageContent(
            target as SystemMessage,
            additionalData,
            false,
            to,
        );
        toCreateNotificationBody.content = content;
        return await this.dataServices.notifications.create(toCreateNotificationBody);
    }

    async markOrUndoMarkAsRead(userId: string, notificationId: string) {
        const existedNotification = await this.dataServices.notifications.findOne({
            to: toObjectId(userId),
            _id: toObjectId(notificationId),
        });
        if (!existedNotification) {
            throw new BadRequestException(`Không tìm thấy thông báo này.`);
        }

        if (existedNotification.isRead) {
            await this.undoMarkAsRead(existedNotification);
        } else {
            await this.markAsRead(existedNotification);
        }

        return true;
    }

    private async markAsRead(notification: Notification) {
        await this.dataServices.notifications.updateById(notification._id, {
            isRead: true,
        });

        return true;
    }

    private async undoMarkAsRead(notification: Notification) {
        await this.dataServices.notifications.updateById(notification._id, {
            isRead: false,
        });

        return true;
    }

    async delete(userId: string, notificationId: string) {
        const existedNotification = await this.dataServices.notifications.findOne({
            to: toObjectId(userId),
            _id: toObjectId(notificationId),
        });
        if (!existedNotification) {
            throw new BadRequestException(`Không tìm thấy thông báo này.`);
        }

        await this.dataServices.notifications.deleteById(notificationId);
        return true;
    }
}
