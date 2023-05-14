import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { GroupPostModule } from '../group-posts/group-post.module';
import { JoinRequestModule } from '../join-requests/join-request.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
    imports: [
        DataServicesModule,
        DataResourcesModule,
        ElasticsearchModule,
        JwtModule,
        JoinRequestModule,
        GroupPostModule,
    ],
    controllers: [GroupController],
    providers: [GroupService],
})
export class GroupModule {}
