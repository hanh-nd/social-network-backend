import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { RoleSeedService } from './seed-role.service';

@Module({
    imports: [CommandModule, DataServicesModule],
    providers: [RoleSeedService],
    exports: [RoleSeedService],
})
export class SeedsModule {}
