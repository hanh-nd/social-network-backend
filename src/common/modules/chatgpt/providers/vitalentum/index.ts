import { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import * as es from 'event-stream';
import { ErrorData, Event, EventStream, MessageData, parseJSON } from '../../utils';
import { CreateAxiosProxy } from '../../utils/proxyAgent';
import {
    ModelType,
    PromptToString,
    Provider,
    ProviderOptions,
    ProviderRequest,
    ProviderResponse,
    SendMessageOptions,
} from '../base';

interface RealReq {
    conversation: string;
    temperature: number;
}

export class VitalentumProvider extends Provider {
    private client: AxiosInstance;

    constructor(options?: ProviderOptions) {
        super(options);
        this.client = CreateAxiosProxy({
            baseURL: 'https://app.vitalentum.io/api',
            headers: {
                'Content-Type': 'application/json',
                accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Proxy-Connection': 'keep-alive',
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
        const stream = new EventStream();
        await this.askStream(req, stream);
        const result: ProviderResponse = {
            text: '',
        };
        return new Promise((resolve) => {
            stream.read(
                (event, data) => {
                    switch (event) {
                        case Event.done:
                            break;
                        case Event.message:
                            result.text += (data as MessageData).content || '';
                            break;
                        case Event.error:
                            result.error = (data as ErrorData).error;
                            break;
                    }
                },
                () => {
                    resolve(result);
                },
            );
        });
    }

    public async askStream(req: ProviderRequest, stream: EventStream) {
        const data: RealReq = {
            conversation: JSON.stringify({ history: [{ speaker: 'human', text: req.prompt }] }),
            temperature: 1.0,
        };
        try {
            const res = await this.client.post('/converse-edge', data, {
                responseType: 'stream',
            } as AxiosRequestConfig);
            res.data.pipe(es.split(/\r?\n\r?\n/)).pipe(
                es.map(async (chunk: any, cb: any) => {
                    const dataStr = chunk.replace('data: ', '');
                    if (!dataStr) {
                        return;
                    }
                    if (dataStr === '[DONE]') {
                        stream.end();
                        return;
                    }
                    const data = parseJSON(dataStr, {} as any);
                    if (!data?.choices) {
                        console.log(data);
                        stream.write(Event.error, { error: 'not found data.choices' });
                        stream.end();
                        return;
                    }
                    const [
                        {
                            delta: { content = '' },
                            finish_reason,
                        },
                    ] = data.choices;
                    if (finish_reason === 'stop') {
                        return;
                    }
                    stream.write(Event.message, { content });
                }),
            );
        } catch (e: any) {
            console.error(e);
            stream.write(Event.error, { error: e.message });
            stream.end();
        }
    }

    public async sendMessage(message: string, { model = ModelType.GPT3p5Turbo }: SendMessageOptions = {}) {
        const [content, messages] = PromptToString(message, this.getLimit(model));
        return this.ask({
            model,
            prompt: content,
            messages,
        });
    }
}
