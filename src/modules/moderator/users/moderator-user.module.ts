import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ModeratorUserController } from './moderator-user.controller';
import { ModeratorUserService } from './moderator-user.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule, JwtModule],
    controllers: [ModeratorUserController],
    providers: [ModeratorUserService],
    exports: [ModeratorUserService],
})
export class ModeratorUserModule {}
