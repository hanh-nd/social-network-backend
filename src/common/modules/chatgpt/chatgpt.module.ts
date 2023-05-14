import { Module } from '@nestjs/common';
import { ChatGPTService } from './chatgpt.service';

@Module({
    providers: [ChatGPTService],
    exports: [ChatGPTService],
})
export class ChatGPTModule {}
