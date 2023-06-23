import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGPTModule } from 'src/common/modules/chatgpt/chatgpt.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SocketModule } from '../gateway/socket.module';
import { SurveyController } from './surveys.controller';
import { SurveyService } from './surveys.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule, ChatGPTModule, SocketModule],
    controllers: [SurveyController],
    providers: [SurveyService],
})
export class SurveyModule {}
