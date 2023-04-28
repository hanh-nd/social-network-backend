import { Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchIndex, Privacy } from 'src/common/constants';
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

    async search(userId: string, query: ISearchQuery) {
        const postSearchResult = await this.searchPost(userId, query);
        const userSearchResult = await this.searchUser(userId, query);

        return {
            posts: postSearchResult,
            users: userSearchResult,
        };
    }

    async searchPost(userId: string, query: ISearchQuery) {
        const { keyword, size = 10 } = query;

        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new NotFoundException(`Không tìm thấy user này.`);
        }

        const postSearchResult = await this.elasticsearchService.search<Post>(
            ElasticsearchIndex.POST,
            {
                bool: {
                    must_not: {
                        terms: {
                            id: user.blockedIds,
                        },
                    },
                    must: [
                        {
                            multi_match: {
                                query: keyword,
                                fields: ['content^5', 'author'],
                            },
                        },
                        {
                            match: {
                                privacy: Privacy.PUBLIC,
                            },
                        },
                    ],
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

    async searchUser(userId: string, query: ISearchQuery) {
        const { keyword, size = 10 } = query;

        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new NotFoundException(`Không tìm thấy user này.`);
        }

        const userSearchResult = await this.elasticsearchService.search<User>(
            ElasticsearchIndex.USER,
            {
                bool: {
                    must_not: {
                        terms: {
                            id: user.blockedIds,
                        },
                    },
                    must: {
                        match: {
                            fullName: keyword,
                        },
                    },
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
