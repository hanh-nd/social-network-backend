import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGPTModule } from './common/modules/chatgpt/chatgpt.module';
import { ElasticsearchModule } from './common/modules/elasticsearch';
import { MongoModule } from './common/modules/mongo';
import { WinstonModule } from './common/modules/winston';
import { DataServicesModule } from './common/repositories/data-services.module';
import { DataResourcesModule } from './common/resources/data-resources.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chats/chat.module';
import { FileModule } from './modules/files/file.module';
import { SocketModule } from './modules/gateway/socket.module';
import { GroupPostModule } from './modules/group-posts/group-post.module';
import { GroupModule } from './modules/groups/group.module';
import { JoinRequestModule } from './modules/join-requests/join-request.module';
import { PostModule } from './modules/posts/post.module';
import { SearchModule } from './modules/search/search.module';
import { SeedsModule } from './modules/seeder/seed.module';
import { UserModule } from './modules/users/user.module';
import { MessageModule } from './modules/messages/message.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MongoModule,
        DataServicesModule,
        DataResourcesModule,
        ElasticsearchModule,
        AuthModule,
        FileModule,
        WinstonModule,
        SeedsModule,
        UserModule,
        PostModule,
        SearchModule,
        SocketModule,
        ChatGPTModule,
        GroupModule,
        GroupPostModule,
        JoinRequestModule,
        MessageModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
    exports: [],
})
export class AppModule implements NestModule {
    configure() {
        mongoose.set('debug', true);
    }
}
