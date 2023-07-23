import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/common/config';
import { CoreSettingKey } from 'src/modules/core-settings/core-settings.constant';
import { CoreSettingsService } from 'src/modules/core-settings/core-settings.service';
import { createWinstonLogger } from '../winston';
import { KeySelector } from './keySelector';

@Injectable()
export class ChatGPTService {
    declare api: any;
    declare keySelector: KeySelector;

    constructor(private configService: ConfigService, private coreSettings: CoreSettingsService) {
        (eval(`import('chatgpt')`) as Promise<typeof import('chatgpt')>).then(({ ChatGPTAPI }) => {
            this.api = new ChatGPTAPI({
                apiKey: this.configService.get<string>(ConfigKey.OPENAI_API_KEY),
            });
        });

        const logger = createWinstonLogger(ChatGPTService.name, this.configService);
        this.getApiKeys().then((keys) => {
            this.keySelector = new KeySelector(keys, 100, {
                logging: logger.error,
            });
        });
    }

    async sendMessage(message: string, options?: any) {
        const totalKeys = this.keySelector.availableKeys.length;
        let err = new Error(`No API provided!`);

        for (let i = 0; i < totalKeys; i++) {
            const key = this.keySelector.get();
            this.api.apiKey = key;
            try {
                const result = await this.api.sendMessage(message, options);
                this.keySelector.push(key, false);
                return result;
            } catch (error) {
                this.keySelector.push(key, true);
                err = error;
            }
        }

        throw err;
    }

    async getApiKeys() {
        const keys = await this.coreSettings.getConfig<string[]>(CoreSettingKey.CHAT_GPT_KEYS);
        return keys || [];
    }
}
