import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { NotificationModule } from '../notifications/notification.module';
import { AskUserQuestionController } from './ask-user-question.controller';
import { AskUserQuestionService } from './ask-user-question.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule, NotificationModule],
    controllers: [AskUserQuestionController],
    providers: [AskUserQuestionService],
    exports: [AskUserQuestionService],
})
export class AskUserQuestionModule {}
