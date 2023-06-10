import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { RoleSeedService } from './seed-role.service';
import { SystemMessageSeedService } from './seed-system-message.service';
import { TagSeedService } from './seed-tag.service';

@Module({
    imports: [CommandModule, DataServicesModule],
    providers: [RoleSeedService, SystemMessageSeedService, TagSeedService],
    exports: [RoleSeedService, SystemMessageSeedService, TagSeedService],
})
export class SeedsModule {}
