import { BadRequestException, Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, NotificationTargetType, SocketEvent } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { NotificationTarget } from 'src/common/interfaces';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Notification, Survey, SystemMessage, User } from 'src/mongo-schemas';
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

        const where = this.buildWhereQuery({
            ...query,
            userId,
        });
        const notifications = await this.dataServices.notifications.findAll(where, {
            populate: ['author', 'target'],
            sort: [['createdAt', -1]],
            skip: +skip,
            limit: +limit,
        });
        const notificationDtos = await this.dataResources.notifications.mapToDtoList(notifications);
        return notificationDtos;
    }

    private buildWhereQuery(query: IGetNotificationListQuery) {
        const { userId, isRead } = query;

        const where: any = {};

        if (userId) {
            where.to = toObjectId(userId);
        }

        if (!isNil(isRead)) {
            try {
                where.isRead = JSON.parse(isRead);
            } catch (error) {}
        }

        return where;
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
                : targetType === NotificationTargetType.SURVEY
                ? await this.createSurveyNotification(to, targetType, target, action, additionalData)
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
        const createdNotification = await this.dataServices.notifications.create(toCreateNotificationBody);
        const notification = await createdNotification.populate(['author', 'target']);
        const notificationDtos = await this.dataResources.notifications.mapToDto(notification);
        return notificationDtos;
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
        const createdNotification = await this.dataServices.notifications.create(toCreateNotificationBody);
        const notification = await createdNotification.populate(['author', 'target']);
        const notificationDtos = await this.dataResources.notifications.mapToDto(notification);
        return notificationDtos;
    }

    private async createSurveyNotification(
        to: Partial<User>,
        targetType: string,
        target: NotificationTarget,
        action: string,
        additionalData?: object,
    ) {
        // create notification
        const toCreateNotificationBody: Partial<Notification> = {
            author: null,
            to: toObjectId(to._id) as unknown,
            targetType,
            target: toObjectId(target._id) as unknown,
            content: (target as Survey).name,
            action,
            additionalData,
            isRead: false,
            urgent: (target as Survey).urgent,
        };
        const createdNotification = await this.dataServices.notifications.create(toCreateNotificationBody);
        const notification = await createdNotification.populate(['author', 'target']);
        const notificationDtos = await this.dataResources.notifications.mapToDto(notification);
        return notificationDtos;
    }

    async markAllAsRead(userId: string) {
        await this.dataServices.notifications.bulkUpdate(
            {
                to: toObjectId(userId),
                isRead: false,
            },
            {
                isRead: true,
            },
        );

        return true;
    }

    async markAsRead(userId: string, notificationId: string) {
        const existedNotification = await this.dataServices.notifications.findOne({
            to: toObjectId(userId),
            _id: toObjectId(notificationId),
        });
        if (!existedNotification) {
            throw new BadRequestException(`Không tìm thấy thông báo này.`);
        }

        if (existedNotification.isRead) return true;

        await this.dataServices.notifications.updateById(existedNotification._id, {
            isRead: true,
        });

        return true;
    }

    async undoMarkAsRead(userId: string, notificationId: string) {
        const existedNotification = await this.dataServices.notifications.findOne({
            to: toObjectId(userId),
            _id: toObjectId(notificationId),
        });
        if (!existedNotification) {
            throw new BadRequestException(`Không tìm thấy thông báo này.`);
        }

        if (!existedNotification.isRead) return true;

        await this.dataServices.notifications.updateById(existedNotification._id, {
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

    async getUnreadNotificationCount(userId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) return 0;

        const count = await this.dataServices.notifications.count({
            to: user._id,
            isRead: false,
        });

        return count;
    }
}
