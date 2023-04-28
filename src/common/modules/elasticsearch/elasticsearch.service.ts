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
        const isIndexExists = await this.exists(index);
        if (!isIndexExists) {
            return [];
        }
        const body = await this.elService.search<K>({
            index,
            query,
            ...options,
        });
        const hits = body.hits.hits;
        return hits.map((item) => item._source);
    }

    async updateById<T, K = Partial<T>>(index: string, id: string, newBody: K) {
        return this.update(
            index,
            {
                match: {
                    id,
                },
            },
            newBody,
        );
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

    async deleteById(index: string, id: string) {
        await this.elService.deleteByQuery({
            index,
            query: {
                match: {
                    id,
                },
            },
        });
    }
}
