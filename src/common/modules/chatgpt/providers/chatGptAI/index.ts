import { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { EventStream } from '../../utils';
import { CreateAxiosProxy } from '../../utils/proxyAgent';
import {
    Message,
    ModelType,
    PromptToString,
    Provider,
    ProviderOptions,
    ProviderRequest,
    ProviderResponse,
    SendMessageOptions,
} from '../base';

interface RealReq {
    _wpnonce: string;
    post_id: string;
    url: string;
    action: string;
    message: string;
    bot_id: string;
}

export class ChatGptAIProvider extends Provider {
    private client: AxiosInstance;

    constructor(options?: ProviderOptions) {
        super(options);
        this.client = CreateAxiosProxy({
            baseURL: 'https://chatgpt.ai/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                authority: 'chatgpt.ai',
                accept: '*/*',
                'accept-language': 'en,fr-FR;q=0.9,fr;q=0.8,es-ES;q=0.7,es;q=0.6,en-US;q=0.5,am;q=0.4,de;q=0.3',
                'cache-control': 'no-cache',
                origin: 'https://chatgpt.ai',
                pragma: 'no-cache',
                referer: 'https://chatgpt.ai/gpt-4/',
                'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            },
        } as CreateAxiosDefaults);
    }

    getLimit(model: ModelType): number {
        switch (model) {
            case ModelType.GPT4:
                return 16000;
            default:
                return 0;
        }
    }

    public async ask(req: ProviderRequest): Promise<ProviderResponse> {
        try {
            const paramResponse = await this.client.get('/');
            const paramResponseData: string = paramResponse.data;
            const regex = new RegExp(
                'data-nonce="(.*)"\n     data-post-id="(.*)"\n     data-url="(.*)"\n     data-bot-id="(.*)"\n     data-width',
            );
            const matched = paramResponseData.match(regex)[0];
            const [nonce, post_id, _, bot_id] = matched
                .split('\n')
                .map((ele) => ele.split('=')[1]?.replace(/\"/g, ''))
                .filter((e) => e);
            const data: RealReq = {
                _wpnonce: nonce,
                post_id: post_id,
                url: 'https://chatgpt.ai/gpt-4',
                action: 'wpaicg_chat_shortcode_message',
                bot_id: bot_id,
                message:
                    req.messages.reduce((chat: string, message: Message) => {
                        return chat + `${message.role}: ${message.content}` + '\n';
                    }, '') + 'assistant: ',
            };
            const response = await this.client.post('/wp-admin/admin-ajax.php', data);
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

    public async sendMessage(message: string, { model = ModelType.GPT3p5Turbo }: SendMessageOptions = {}) {
        const [content, messages] = PromptToString(message, this.getLimit(model));
        return this.ask({
            model,
            prompt: content,
            messages,
        });
    }
}
