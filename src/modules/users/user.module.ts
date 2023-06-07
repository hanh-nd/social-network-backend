import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { FileModule } from '../files/file.module';
import { SocketModule } from '../gateway/socket.module';
import { NotificationModule } from '../notifications/notification.module';
import { SubscribeRequestModule } from '../subscribe-requests/subscribe-request.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [
        DataServicesModule,
        DataResourcesModule,
        FileModule,
        ElasticsearchModule,
        SocketModule,
        NotificationModule,
        SubscribeRequestModule,
    ],
    providers: [JwtService, UserService],
    controllers: [UserController],
    exports: [],
})
export class UserModule {}
