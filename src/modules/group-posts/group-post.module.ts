import { Module } from '@nestjs/common';
import { PostModule } from '../posts/post.module';
import { GroupPostService } from './group-post.service';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';

@Module({
    imports: [DataServicesModule, DataResourcesModule, PostModule],
    providers: [GroupPostService],
    exports: [GroupPostService],
})
export class GroupPostModule {}
