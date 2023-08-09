import { Injectable, NotFoundException } from '@nestjs/common';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ElasticsearchIndex } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { MongoGenericRepository } from 'src/common/repositories/mongo/mongo-generic.repository';
import { IDataResources } from 'src/common/resources/data.resource';
import { IGetGroupListQuery } from 'src/modules/groups/group.interface';
import { GroupDocument } from 'src/mongo-schemas';
import { IGetModGroupStatisticQuery } from './moderator-group.interface';

@Injectable()
export class ModeratorGroupService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
    ) {}

    async getGroupList(query?: IGetGroupListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT, keyword } = query;
        const skip = (+page - 1) * +limit;

        const match = this._buildWhereQuery(query);
        return await this.dataServices.groups.findAll(match, {
            populate: ['administrators.user'],
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
            ignoreSoftDelete: true,
        });
    }

    _buildWhereQuery(query: IGetGroupListQuery) {
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

    async getGroupDetail(id: string) {
        const group = await this.dataServices.groups.findById(id, {
            populate: [
                'administrators.user',
                {
                    path: 'pinnedPosts',
                    populate: [
                        {
                            path: 'post',
                            populate: 'author',
                        },
                    ],
                },
            ],
        });
        if (!group) {
            throw new NotFoundException(`Không tìm thấy nhóm này.`);
        }

        return group;
    }

    async deleteGroup(id: string) {
        const existedGroup = await this.dataServices.groups.findOne({
            _id: id,
        });
        if (!existedGroup) {
            throw new NotFoundException(`Không tìm thấy nhóm này.`);
        }
        await this.dataServices.groups.deleteById(existedGroup._id);

        await this.elasticsearchService.deleteById(ElasticsearchIndex.GROUP, existedGroup._id);
        return true;
    }

    async bulkDeleteGroups(ids: string[]) {
        return await Promise.all(ids.map((id) => this.deleteGroup(id)));
    }

    async getGroupStatistic(query?: IGetModGroupStatisticQuery) {
        const [status, group] = await Promise.all([this.getGroupStatusStatistic(), this.getGroupGroupStatistic(query)]);

        return {
            ...status,
            group,
        };
    }

    async getGroupStatusStatistic() {
        const [total, totalActive] = await Promise.all([
            (this.dataServices.groups as MongoGenericRepository<GroupDocument>).getModel().count(),
            (this.dataServices.groups as MongoGenericRepository<GroupDocument>)
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

    async getGroupGroupStatistic(query?: IGetModGroupStatisticQuery) {
        const match = this._buildStatisticQuery(query);
        const groupCountByDate = await (this.dataServices.groups as MongoGenericRepository<GroupDocument>)
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
        return orderBy(groupCountByDate, '_id', 'asc');
    }

    _buildStatisticQuery(query: IGetModGroupStatisticQuery) {
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
