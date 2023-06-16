import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatGPTModule } from 'src/common/modules/chatgpt/chatgpt.module';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { CommentModule } from '../comments/comment.module';
import { FileService } from '../files/file.service';
import { SocketModule } from '../gateway/socket.module';
import { NotificationModule } from '../notifications/notification.module';
import { ReactionModule } from '../reactions/reaction.module';
import { ReportModule } from '../reports/report.module';
import { TagModule } from '../tags/tag.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    imports: [
        DataServicesModule,
        DataResourcesModule,
        ElasticsearchModule,
        CommentModule,
        ReactionModule,
        ReportModule,
        NotificationModule,
        ChatGPTModule,
        TagModule,
        SocketModule,
        RedisModule,
    ],
    controllers: [PostController],
    providers: [JwtService, PostService, FileService],
    exports: [PostService],
})
export class PostModule {}
