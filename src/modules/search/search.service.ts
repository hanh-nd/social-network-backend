import { Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchIndex, Privacy, SubscribeRequestStatus } from 'src/common/constants';
import { toObjectIds } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Group, Post, User } from 'src/mongo-schemas';
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
        const groupSearchResult = await this.searchGroup(userId, query);

        return {
            posts: postSearchResult,
            users: userSearchResult,
            groups: groupSearchResult,
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
                    must_not: [
                        {
                            terms: {
                                id: user.blockedIds,
                            },
                        },
                        {
                            match: {
                                privacy: Privacy.PRIVATE,
                            },
                        },
                    ],
                    must: [
                        {
                            multi_match: {
                                query: keyword,
                                fields: ['content^5', 'author'],
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
        const posts = await this.dataServices.posts.findAll(
            {
                _id: toObjectIds(postSearchIds),
            },
            {
                populate: ['author'],
            },
        );
        const postsFilterByPrivacy = posts.filter((post) => {
            if (post.privacy === Privacy.PRIVATE) return false;
            if (post.privacy === Privacy.PUBLIC) return true;
            const postAuthorSubscribingIds = post.author.subscribingIds;
            const isLoginUserSubscribedAUthor = postAuthorSubscribingIds.map((id) => `${id}`).includes(`${userId}`);
            return isLoginUserSubscribedAUthor;
        });
        const postDtos = await this.dataResources.posts.mapToDtoList(postsFilterByPrivacy, user);
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

    async searchGroup(userId: string, query: ISearchQuery) {
        const { keyword, size = 10 } = query;

        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new NotFoundException(`Không tìm thấy user này.`);
        }

        const groupSearchResult = await this.elasticsearchService.search<Group>(
            ElasticsearchIndex.GROUP,
            {
                bool: {
                    // must_not: {
                    //     terms: {
                    //         blockIds: `${user._id}`,
                    //     },
                    // },
                    must: {
                        match: {
                            name: keyword,
                        },
                    },
                },
            },
            {
                size,
            },
        );
        const groupSearchIds = groupSearchResult.map((result) => result.id);
        const groups = await this.dataServices.groups.findAll({
            _id: toObjectIds(groupSearchIds),
        });

        const groupDtos = await this.dataResources.groups.mapToDtoList(groups, user);

        const pendingJoinRequests = await this.dataServices.joinRequests.findAll({
            sender: user._id,
            group: toObjectIds(groups.map((g) => `${g._id}`)),
            status: SubscribeRequestStatus.PENDING,
        });

        for (const groupDto of groupDtos) {
            const pendingJoinRequest = pendingJoinRequests.find((pd) => `${pd.group}` == `${(groupDto as Group)._id}`);
            if (pendingJoinRequest) {
                Object.assign(groupDto, {
                    isPending: true,
                });
            }
        }

        return groupDtos;
    }
}
