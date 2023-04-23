import { Injectable, NotFoundException } from '@nestjs/common';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';

@Injectable()
export class UserService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

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
}
