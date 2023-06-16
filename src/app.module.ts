import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessLogInterceptor } from './common/interceptors/access-log.interceptor';
import { ChatGPTModule } from './common/modules/chatgpt/chatgpt.module';
import { ElasticsearchModule } from './common/modules/elasticsearch';
import { MongoModule } from './common/modules/mongo';
import { RedisModule } from './common/modules/redis/redis.module';
import { WinstonModule } from './common/modules/winston';
import { DataServicesModule } from './common/repositories/data-services.module';
import { DataResourcesModule } from './common/resources/data-resources.module';
import { AskUserQuestionModule } from './modules/ask-user-questions/ask-user-question.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chats/chat.module';
import { CoreSettingsModule } from './modules/core-settings/core-settings.module';
import { CronJobModule } from './modules/cron-jobs/cron-job.module';
import { FileModule } from './modules/files/file.module';
import { SocketModule } from './modules/gateway/socket.module';
import { GroupPostModule } from './modules/group-posts/group-post.module';
import { GroupModule } from './modules/groups/group.module';
import { JoinRequestModule } from './modules/join-requests/join-request.module';
import { MessageModule } from './modules/messages/message.module';
import { ModeratorPostModule } from './modules/moderator/posts/moderator-post.module';
import { ModeratorReportModule } from './modules/moderator/reports/moderator-report.module';
import { ModeratorUserModule } from './modules/moderator/users/moderator-user.module';
import { PostModule } from './modules/posts/post.module';
import { RoleModule } from './modules/roles/role.module';
import { SearchModule } from './modules/search/search.module';
import { SeedsModule } from './modules/seeder/seed.module';
import { StatisticModule } from './modules/statistics/statistic.module';
import { SystemMessageModule } from './modules/system-messages/system-message.module';
import { TagModule } from './modules/tags/tag.module';
import { UserModule } from './modules/users/user.module';

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
        TagModule,
        ModeratorPostModule,
        ModeratorReportModule,
        ModeratorUserModule,
        RoleModule,
        RedisModule,
        SystemMessageModule,
        ScheduleModule.forRoot(),
        CronJobModule,
        AskUserQuestionModule,
        StatisticModule,
        CoreSettingsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        JwtService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AccessLogInterceptor,
        },
    ],
    exports: [],
})
export class AppModule implements NestModule {
    configure() {
        mongoose.set('debug', true);
    }
}
