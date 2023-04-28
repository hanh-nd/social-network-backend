import { QueryDslQueryContainer, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ELService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService {
    constructor(private elService: ELService) {}

    async index<T, K = Partial<T>>(index: string, item: K) {
        return this.elService.index<K>({
            index,
            body: item,
        });
    }

    async search<T, K = Partial<T>>(index: string, query: QueryDslQueryContainer, options?: Partial<SearchRequest>) {
        const body = await this.elService.search<K>({
            index,
            query,
            ...options,
        });
        const hits = body.hits.hits;
        return hits.map((item) => item._source);
    }

    async update<T, K = Partial<T>>(index: string, query: QueryDslQueryContainer, newBody: K) {
        const script = Object.entries(newBody).reduce((result, [key, value]) => {
            return `${result} ctx._source.${key}='${value}';`;
        }, '');
        return this.elService.updateByQuery({
            index,
            query,
            script: script,
        });
    }

    async exists(index: string) {
        return this.elService.indices.exists({ index });
    }
}
