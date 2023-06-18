import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/common/config';

@Injectable()
export class ChatGPTService {
    declare api: any;

    constructor(private configService: ConfigService) {
        (eval(`import('chatgpt')`) as Promise<typeof import('chatgpt')>).then(({ ChatGPTAPI }) => {
            this.api = new ChatGPTAPI({
                apiKey: this.configService.get<string>(ConfigKey.OPENAI_API_KEY),
            });
        });
    }

    async sendMessage(message: string, options?: any) {
        return await this.api.sendMessage(message, options);
    }
}
