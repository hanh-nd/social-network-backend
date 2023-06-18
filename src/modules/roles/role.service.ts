import { Injectable } from '@nestjs/common';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Role } from 'src/mongo-schemas';

@Injectable()
export class RoleService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private redisService: RedisService,
    ) {}

    async getRoles() {
        const cachedData = await this.redisService.get<Role[]>(RedisKey.ROLES);
        if (cachedData) return cachedData;
        const data = await this.dataServices.roles.findAll({}, { lean: true });
        await this.redisService.set(RedisKey.ROLES, data);
        return data;
    }
}
