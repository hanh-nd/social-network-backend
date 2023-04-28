import { Injectable } from '@nestjs/common';
import { ElasticsearchIndex } from 'src/common/constants';
import { toObjectIds } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Post, User } from 'src/mongo-schemas';
import { ISearchQuery } from './search.interface';
@Injectable()
export class SearchService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
    ) {}

    async search(query: ISearchQuery) {
        const postSearchResult = await this.searchPost(query);
        const userSearchResult = await this.searchUser(query);

        return {
            posts: postSearchResult,
            users: userSearchResult,
        };
    }

    async searchPost(query: ISearchQuery) {
        const { keyword, size = 10 } = query;
        const isIndexExists = await this.elasticsearchService.exists(ElasticsearchIndex.POST);
        if (!isIndexExists) return [];

        const postSearchResult = await this.elasticsearchService.search<Post>(
            ElasticsearchIndex.POST,
            {
                multi_match: {
                    query: keyword,
                    fields: ['content'],
                },
            },
            {
                size,
            },
        );
        const postSearchIds = postSearchResult.map((result) => result.id);
        const posts = await this.dataServices.posts.findAll({
            _id: toObjectIds(postSearchIds),
        });
        const postDtos = await this.dataResources.posts.mapToDtoList(posts);
        return {
            item: postDtos,
            totalItem: postDtos.length,
        };
    }

    async searchUser(query: ISearchQuery) {
        const { keyword, size = 10 } = query;
        const isIndexExists = await this.elasticsearchService.exists(ElasticsearchIndex.USER);
        if (!isIndexExists) return [];

        const userSearchResult = await this.elasticsearchService.search<User>(
            ElasticsearchIndex.USER,
            {
                multi_match: {
                    query: keyword,
                    fields: ['fullName'],
                },
            },
            {
                size,
            },
        );
        const userSearchIds = userSearchResult.map((result) => result.id);
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds(userSearchIds),
        });
        const userDtos = await this.dataResources.users.mapToDtoList(users);
        return {
            item: userDtos,
            totalItem: userDtos.length,
        };
    }
}
