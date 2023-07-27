import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreSettingKey } from 'src/modules/core-settings/core-settings.constant';
import { CoreSettingsService } from 'src/modules/core-settings/core-settings.service';
import { createWinstonLogger } from '../winston';
import { KeySelector } from './keySelector';
import { ChatProviderFactory, ProviderType } from './providers';
import { SendMessageOptions } from './providers/base';

@Injectable()
export class ChatGPTService {
    declare keySelector: KeySelector;
    declare factory: ChatProviderFactory;

    constructor(private configService: ConfigService, private coreSettings: CoreSettingsService) {
        this.factory = new ChatProviderFactory();
        const logger = createWinstonLogger(ChatGPTService.name, this.configService);
        this.getApiKeys().then((keys) => {
            this.keySelector = new KeySelector(keys, 100, {
                logging: logger.error,
            });
        });
    }

    async sendMessage(message: string, options?: SendMessageOptions) {
        const totalKeys = this.keySelector.availableKeys.length;
        let err = new Error(`No API provided!`);

        for (let i = 0; i < totalKeys; i++) {
            const key = this.keySelector.get();
            try {
                const provider = this.factory.get(ProviderType.Vitalentum);
                const result = await provider.sendMessage(message, { apiKey: key, ...options });
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
