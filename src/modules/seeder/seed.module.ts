import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { JobSeedService } from './seed-job.service';
import { RoleSeedService } from './seed-role.service';
import { SystemMessageSeedService } from './seed-system-message.service';
import { TagSeedService } from './seed-tag.service';

@Module({
    imports: [CommandModule, DataServicesModule, RedisModule],
    providers: [RoleSeedService, SystemMessageSeedService, TagSeedService, JobSeedService],
    exports: [RoleSeedService, SystemMessageSeedService, TagSeedService, JobSeedService],
})
export class SeedsModule {}
