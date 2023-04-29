import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { CommentService } from './comment.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule {}
