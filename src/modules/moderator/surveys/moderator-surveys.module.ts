import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGPTModule } from 'src/common/modules/chatgpt/chatgpt.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ModeratorSurveyController } from './moderator-surveys.controller';
import { ModeratorSurveyService } from './moderator-surveys.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule, ChatGPTModule],
    controllers: [ModeratorSurveyController],
    providers: [ModeratorSurveyService],
})
export class ModeratorSurveyModule {}
