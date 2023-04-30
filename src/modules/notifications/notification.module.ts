import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SocketModule } from '../gateway/socket.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule, SocketModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
