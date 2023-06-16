import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { CoreSettingsController } from './core-settings.controller';
import { CoreSettingsService } from './core-settings.service';

@Module({
    imports: [DataServicesModule],
    controllers: [CoreSettingsController],
    providers: [CoreSettingsService],
})
export class CoreSettingsModule {}
