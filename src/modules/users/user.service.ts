import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { compare, hash } from 'src/plugins/bcrypt';
import { FileService } from '../files/file.service';
import { IChangePasswordBody, IUpdateProfileBody } from './user.interface';

@Injectable()
export class UserService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private fileService: FileService,
    ) {}

    async getLoginUserProfile(userId: string) {
        const user = await this.dataServices.users.findById(userId, {
            select: ['-password', '-blockedIds'],
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        const userDto = await this.dataResources.users.mapToDto(user);
        return userDto;
    }

    async changeUserPassword(userId: string, body: IChangePasswordBody) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }
        const isCorrectPassword = await compare(body.oldPassword, existedUser.password);
        if (!isCorrectPassword) {
            throw new ForbiddenException(`Mật khẩu không đúng. Vui lòng thử lại.`);
        }

        const hashedPassword = await hash(body.password);
        await this.dataServices.users.updateById(existedUser._id, {
            password: hashedPassword,
        });

        return true;
    }

    async updateProfile(userId: string, body: IUpdateProfileBody) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        await this.dataServices.users.updateById(userId, body);

        return true;
    }

    async getSubscribers(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const subscriberIds = existedUser.subscriberIds;
        const subscribers = await this.dataServices.users.findAll({
            _id: {
                $in: subscriberIds,
            },
        });

        return {
            items: subscribers,
            totalItems: subscribers.length,
        };
    }

    async removeSubscribers(userId: string, toRemoveId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const subscriberIds = existedUser.subscriberIds;
        const newSubscriberIds = subscriberIds.filter((subId) => subId.toString() !== toRemoveId);
        await this.dataServices.users.updateById(existedUser._id, {
            subscriberIds: newSubscriberIds,
        });

        return true;
    }

    async getBlockedList(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const blockedIds = existedUser.blockedIds;
        const blockedList = await this.dataServices.users.findAll({
            _id: {
                $in: blockedIds,
            },
        });

        return {
            items: blockedList,
            totalItems: blockedList.length,
        };
    }

    async getSubscribing(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const subscribingIds = existedUser.subscribingIds;
        const subscribing = await this.dataServices.users.findAll({
            _id: {
                $in: subscribingIds,
            },
        });

        return {
            items: subscribing,
            totalItems: subscribing.length,
        };
    }

    async getUserFiles(userId: string) {
        return await this.fileService.findAll({
            userId,
        });
    }
}
