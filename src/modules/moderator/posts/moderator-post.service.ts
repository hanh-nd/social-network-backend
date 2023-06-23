import { Injectable, NotFoundException } from '@nestjs/common';
import { orderBy, remove } from 'lodash';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ElasticsearchIndex } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { MongoGenericRepository } from 'src/common/repositories/mongo/mongo-generic.repository';
import { IDataResources } from 'src/common/resources/data.resource';
import { IGetPostListQuery } from 'src/modules/posts/post.interface';
import { PostDocument } from 'src/mongo-schemas';
import { IGetModPostStatisticQuery } from './moderator-post.interface';

@Injectable()
export class ModeratorPostService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
    ) {}

    async getPostList(query?: IGetPostListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT, keyword } = query;
        const skip = (+page - 1) * +limit;

        const match = this._buildWhereQuery(query);
        return await this.dataServices.posts.findAll(match, {
            populate: [
                {
                    path: 'author',
                    select: 'id avatarId fullName',
                },
            ],
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
            ignoreSoftDelete: true,
        });
    }

    _buildWhereQuery(query: IGetPostListQuery) {
        const { keyword } = query;
        const where: any = {};

        if (keyword?.trim()) {
            where['$or'] = [
                ObjectId.isValid(keyword) && {
                    _id: toObjectId(keyword),
                },
            ];
        }

        return where;
    }

    async getPostDetail(id: string) {
        const post = await this.dataServices.posts.findById(id, {
            populate: [
                {
                    path: 'author',
                    select: 'id avatarId fullName',
                },
            ],
        });
        if (!post) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        return post;
    }

    async deletePost(id: string) {
        const existedPost = await this.dataServices.posts.findOne(
            {
                _id: id,
            },
            {
                populate: ['postShared'],
            },
        );
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }
        await this.dataServices.posts.deleteById(existedPost._id, {
            isDeletedBySystem: true,
        });
        await this.dataServices.groupPosts.deleteOne({
            post: toObjectId(id),
        });
        await this.elasticsearchService.deleteById(ElasticsearchIndex.POST, existedPost._id);
        if (existedPost.postShared) {
            const postSharedShareIds = existedPost.postShared.sharedIds;
            remove(postSharedShareIds, (id) => `${id}` == existedPost._id);
            await this.dataServices.posts.updateById(existedPost.postShared._id, {
                sharedIds: postSharedShareIds,
            });
        }
        return true;
    }

    async bulkDeletePosts(ids: string[]) {
        return await Promise.all(ids.map((id) => this.deletePost(id)));
    }

    async getPostStatistic(query?: IGetModPostStatisticQuery) {
        const [status, group] = await Promise.all([this.getPostStatusStatistic(), this.getPostGroupStatistic(query)]);

        return {
            ...status,
            group,
        };
    }

    async getPostStatusStatistic() {
        const [total, totalActive] = await Promise.all([
            (this.dataServices.posts as MongoGenericRepository<PostDocument>).getModel().count(),
            (this.dataServices.posts as MongoGenericRepository<PostDocument>)
                .getModel()
                .where({
                    deletedAt: null,
                })
                .count(),
        ]);
        return {
            total,
            totalDeactivated: total - totalActive,
            totalActive,
        };
    }

    async getPostGroupStatistic(query?: IGetModPostStatisticQuery) {
        const match = this._buildStatisticQuery(query);
        const postCountByDate = await (this.dataServices.posts as MongoGenericRepository<PostDocument>)
            .getModel()
            .aggregate([
                {
                    $match: match,
                },
                {
                    $group: {
                        _id: '$createdDate',
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]);
        return orderBy(postCountByDate, '_id', 'asc');
    }

    _buildStatisticQuery(query: IGetModPostStatisticQuery) {
        const { range = 30 } = query;
        const where: any = {};

        if (range) {
            where.createdAt = {
                $lte: moment().toDate(),
                $gte: moment().startOf('day').subtract(range, 'day').toDate(),
            };
        }
        return where;
    }
}
