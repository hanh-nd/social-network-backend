import { EventStream, getTokenSize } from '../utils';

export interface ProviderOptions {}

export interface ProviderResponse {
    text?: string;
    error?: string;
}

export type Message = {
    role: string;
    content: string;
};

export enum ModelType {
    GPT3p5Turbo = 'gpt-3.5-turbo',
    GPT3p5_16k = 'gpt-3.5-turbo-16k',
    GPT4 = 'gpt-4',
    GPT4_32k = 'gpt-4-32k',
    Sage = 'sage',
    NetGpt3p5 = 'net-gpt3.5-turbo',
    ClaudeInstance = 'claude-instance',
    Claude = 'claude',
    Claude100k = 'claude-100k',
    Claude2_100k = 'claude-2-100k',
    Gpt4free = 'gpt4free',
    GooglePalm = 'google-palm',
}

export interface ProviderRequest {
    prompt: string;
    model: ModelType;
    messages: Message[];
}

export interface SendMessageOptions {
    model?: ModelType;
    apiKey?: string;
}

export function PromptToString(prompt: string, limit: number): [string, Message[]] {
    try {
        const messages: Message[] = JSON.parse(prompt);
        const res = `${messages.map((item) => `${item.role}: ${item.content}`).join('\n')}\nassistant: `;
        console.log(prompt.length, limit, getTokenSize(res));
        if (getTokenSize(res) >= limit && messages.length > 1) {
            return PromptToString(JSON.stringify(messages.slice(1, messages.length)), limit);
        }
        return [res, messages];
    } catch (e) {
        return [prompt, [{ role: 'user', content: prompt }]];
    }
}

export abstract class Provider {
    protected options: ProviderOptions | undefined;

    protected constructor(options?: ProviderOptions) {
        this.options = options;
    }

    public abstract getLimit(model: ModelType): number;

    public abstract ask(req: ProviderRequest): Promise<ProviderResponse>;

    public abstract askStream(req: ProviderRequest, stream: EventStream): Promise<void>;

    public async sendMessage(message: string, options: SendMessageOptions = {}) {
        const { model = ModelType.GPT3p5Turbo } = options;
        const [content, messages] = PromptToString(message, this.getLimit(model));
        return this.ask({
            model,
            prompt: content,
            messages,
            ...options,
        });
    }
}
