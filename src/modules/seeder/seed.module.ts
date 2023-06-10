import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { RoleSeedService } from './seed-role.service';
import { SystemMessageSeedService } from './seed-system-message.service';

@Module({
    imports: [CommandModule, DataServicesModule],
    providers: [RoleSeedService, SystemMessageSeedService],
    exports: [RoleSeedService, SystemMessageSeedService],
})
export class SeedsModule {}
