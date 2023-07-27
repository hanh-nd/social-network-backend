import { Provider, ProviderOptions } from './base';
import { VitalentumProvider } from './vitalentum';

export enum ProviderType {
    Vitalentum = 'vitalentum',
}

export class ChatProviderFactory {
    private providerMap: Map<ProviderType, Provider>;
    private readonly options: ProviderOptions | undefined;

    constructor(options?: ProviderOptions) {
        this.providerMap = new Map();
        this.options = options;
        this.init();
    }

    init() {
        // register new model here
        this.providerMap.set(ProviderType.Vitalentum, new VitalentumProvider(this.options));
    }

    get(model: ProviderType): Provider | undefined {
        return this.providerMap.get(model);
    }
}
