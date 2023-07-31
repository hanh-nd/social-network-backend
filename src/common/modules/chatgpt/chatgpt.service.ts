import { Injectable } from '@nestjs/common';
import { CoreSettingsService } from 'src/modules/core-settings/core-settings.service';
import { ChatProviderFactory, ProviderType } from './providers';
import { SendMessageOptions } from './providers/base';

@Injectable()
export class ChatGPTService {
    declare factory: ChatProviderFactory;

    constructor(private coreSettings: CoreSettingsService) {
        this.factory = new ChatProviderFactory(this.coreSettings);
    }

    async sendMessage(message: string, options?: SendMessageOptions) {
        for (const providerType of Object.values(ProviderType)) {
            const provider = this.factory.get(providerType);
            const result = await provider.sendMessage(message, options);
            if (result.error || !result.text) {
                continue;
            }
            return result;
        }
    }
}
