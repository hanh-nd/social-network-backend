import { Module } from '@nestjs/common';
import { CoreSettingsModule } from 'src/modules/core-settings/core-settings.module';
import { ChatGPTService } from './chatgpt.service';

@Module({
    imports: [CoreSettingsModule],
    providers: [ChatGPTService],
    exports: [ChatGPTService],
})
export class ChatGPTModule {}
