import { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { CoreSettingKey } from 'src/modules/core-settings/core-settings.constant';
import { CoreSettingsService } from 'src/modules/core-settings/core-settings.service';
import { KeySelector } from '../../keySelector';
import { EventStream } from '../../utils';
import { CreateAxiosProxy } from '../../utils/proxyAgent';
import { ModelType, Provider, ProviderOptions, ProviderRequest, ProviderResponse } from '../base';

interface Message {
    role: string;
    content: string;
}

interface RealReq {
    messages: Message[];
    temperature: number;
    stream: boolean;
    model: string;
}

export class OpenAIProvider extends Provider {
    private client: AxiosInstance;
    private keySelector: KeySelector;
    private coreSettingsService: CoreSettingsService;

    constructor(coreSettingsService: CoreSettingsService, options?: ProviderOptions) {
        super(options);
        this.client = CreateAxiosProxy({
            baseURL: 'https://api.openai.com/v1/',
            headers: {
                'Content-Type': 'application/json',
            },
        } as CreateAxiosDefaults);
        this.coreSettingsService = coreSettingsService;
        this.getApiKeys().then((keys) => {
            this.keySelector = new KeySelector(keys, 100, {
                logging: console.log,
            });
        });
    }

    getLimit(model: ModelType): number {
        switch (model) {
            case ModelType.GPT3p5Turbo:
                return 2000;
            default:
                return 0;
        }
    }

    public async ask(req: ProviderRequest): Promise<ProviderResponse> {
        const totalKeys = this.keySelector.availableKeys.length;
        console.log('totalKeys', this.keySelector.availableKeys);
        const data: RealReq = {
            messages: [{ role: 'user', content: req.prompt }],
            temperature: 1.0,
            model: req.model,
            stream: false,
        };

        for (let i = 0; i < totalKeys; i++) {
            const key = this.keySelector.get();
            try {
                const response = await this.client.post('/chat/completions', data, {
                    headers: {
                        Authorization: `Bearer ${key}`,
                    },
                } as AxiosRequestConfig);
                const text = response.data?.choices?.[0]?.message?.content || '';
                if (text) {
                    this.keySelector.push(key, false);
                    return {
                        text,
                    };
                } else {
                    throw new Error();
                }
            } catch (error) {
                this.keySelector.push(key, true);
            }
        }

        return {
            text: '',
        };
    }

    public async askStream(req: ProviderRequest, stream: EventStream) {}

    private async getApiKeys() {
        const keys = await this.coreSettingsService.getConfig<string[]>(CoreSettingKey.CHAT_GPT_KEYS);
        return keys || [];
    }
}
