import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule, RedisModule],
    controllers: [TagController],
    providers: [TagService],
    exports: [TagService],
})
export class TagModule {}
