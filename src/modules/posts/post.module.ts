import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { CommentModule } from '../comments/comment.module';
import { FileService } from '../files/file.service';
import { ReactionModule } from '../reactions/reaction.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule, CommentModule, ReactionModule],
    controllers: [PostController],
    providers: [JwtService, PostService, FileService],
})
export class PostModule {}
