import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, RedisModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule {}
