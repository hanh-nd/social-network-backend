import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ReactionService } from './reaction.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule],
    providers: [ReactionService],
    exports: [ReactionService],
})
export class ReactionModule {}
