import { CoreSettingsService } from './../../../../modules/core-settings/core-settings.service';
import { AiServiceProvider } from './aiService';
import { Provider, ProviderOptions } from './base';
import { ChatGptAIProvider } from './chatGptAI';
import { OpenAIProvider } from './openai';
import { VitalentumProvider } from './vitalentum';

export enum ProviderType {
    // Vitalentum = 'vitalentum',
    ChatGptAI = 'chatgptai',
    AiService = 'aiservice',
    OpenAI = 'openai',
}

export class ChatProviderFactory {
    private providerMap: Map<ProviderType, Provider>;
    private readonly options: ProviderOptions | undefined;
    private coreSettingsService: CoreSettingsService;

    constructor(coreSettingsService: CoreSettingsService, options?: ProviderOptions) {
        this.providerMap = new Map();
        this.coreSettingsService = coreSettingsService;
        this.options = options;
        this.init();
    }

    init() {
        // register new model here
        // this.providerMap.set(ProviderType.Vitalentum, new VitalentumProvider(this.options));
        this.providerMap.set(ProviderType.ChatGptAI, new ChatGptAIProvider(this.options));
        this.providerMap.set(ProviderType.AiService, new AiServiceProvider(this.options));
        this.providerMap.set(ProviderType.OpenAI, new OpenAIProvider(this.coreSettingsService, this.options));
    }

    get(model: ProviderType): Provider | undefined {
        return this.providerMap.get(model);
    }
}
