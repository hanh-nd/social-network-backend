import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { CoreSettingsController } from './core-settings.controller';
import { CoreSettingsService } from './core-settings.service';

@Module({
    imports: [DataServicesModule, RedisModule],
    controllers: [CoreSettingsController],
    providers: [CoreSettingsService],
    exports: [CoreSettingsService],
})
export class CoreSettingsModule {}
