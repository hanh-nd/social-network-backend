import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGPTModule } from 'src/common/modules/chatgpt/chatgpt.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { MessageModule } from '../messages/message.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, MessageModule, JwtModule, ChatGPTModule],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {}
