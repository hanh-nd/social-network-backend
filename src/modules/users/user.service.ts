import { Injectable, NotFoundException } from '@nestjs/common';
import { IDataServices } from 'src/common/repositories/data.service';

@Injectable()
export class UserService {
    constructor(private dataServices: IDataServices) {}

    async getLoginUserProfile(userId: string) {
        const user = await this.dataServices.users.findById(userId, {
            select: ['-password', '-blockedIds'],
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        const userDto = Object.assign({}, user.toObject(), {
            subscribers: user.subscriberIds.length,
            subscribing: user.subscribingIds.length,
        });

        delete userDto.subscriberIds;
        delete userDto.subscribingIds;

        return userDto;
    }
}
