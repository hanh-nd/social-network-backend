import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, SocketEvent } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { NotificationTarget } from 'src/common/interfaces';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Notification, User } from 'src/mongo-schemas';
import { SocketGateway } from '../gateway/socket.gateway';
import { IGetNotificationListQuery } from './notification.interface';

@Injectable()
export class NotificationService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private socketGateway: SocketGateway,
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
        user: Partial<User>,
        to: Partial<User>,
        targetType: string,
        target: NotificationTarget,
        action: string,
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
        };
        const createdNotification = await this.dataServices.notifications.create(toCreateNotificationBody);
        this.socketGateway.server.to(`${to._id}`).emit(SocketEvent.USER_NOTIFICATION, createdNotification);
        return createdNotification._id;
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
