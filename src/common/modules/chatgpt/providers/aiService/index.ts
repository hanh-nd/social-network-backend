import { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { EventStream } from '../../utils';
import { CreateAxiosProxy } from '../../utils/proxyAgent';
import { ModelType, Provider, ProviderOptions, ProviderRequest, ProviderResponse } from '../base';

interface Message {
    role: string;
    content: string;
}

interface RealReq {
    input: string;
}

export class AiServiceProvider extends Provider {
    private client: AxiosInstance;

    constructor(options?: ProviderOptions) {
        super(options);
        this.client = CreateAxiosProxy({
            baseURL: 'https://aiservice.vercel.app/api/chat/',
            headers: {
                accept: '*/*',
                'content-type': 'text/plain;charset=UTF-8',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                Referer: 'https://aiservice.vercel.app/chat',
            },
        } as CreateAxiosDefaults);
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
        try {
            const data: RealReq = {
                input:
                    req.messages.reduce((chat: string, message: Message) => {
                        return chat + `${message.role}: ${message.content}` + '\n';
                    }, '') + 'assistant: ',
            };
            const response = await this.client.post('/answer', data);
            return {
                text: response.data.data,
            };
        } catch (error) {
            return {
                text: '',
            };
        }
    }

    public async askStream(req: ProviderRequest, stream: EventStream) {}
}
