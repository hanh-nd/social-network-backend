import { Injectable, NotFoundException } from '@nestjs/common';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ElasticsearchIndex } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { MongoGenericRepository } from 'src/common/repositories/mongo/mongo-generic.repository';
import { IDataResources } from 'src/common/resources/data.resource';
import { IGetUserListQuery, IUpdateProfileBody } from 'src/modules/users/user.interface';
import { User, UserDocument } from 'src/mongo-schemas';
import { IGetModUserStatisticQuery, IUpdateUserRoleBody } from './moderator-user.interface';

@Injectable()
export class ModeratorUserService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
    ) {}

    async getUserList(query?: IGetUserListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT, keyword } = query;
        const skip = (+page - 1) * +limit;
        const where = await this._buildSearchQuery(query);
        return await this.dataServices.users.findAll(where, {
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
            ignoreSoftDelete: true,
        });
    }

    async _buildSearchQuery(query: IGetUserListQuery) {
        const { keyword } = query;

        const where: any = {};

        if (keyword) {
            where['$or'] = [
                {
                    _id: toObjectId(keyword),
                },
                {
                    username: keyword,
                },
                {
                    mobile: keyword,
                },
                {
                    fullName: keyword,
                },
                {
                    email: keyword,
                },
            ];
        }

        return where;
    }

    async getUserDetail(id: string) {
        const existedUser = await this.dataServices.users.findById(id);
        if (!existedUser) throw new NotFoundException(`Không tìm thấy người dùng này.`);

        return await this.dataServices.userDetails.findOne({
            userId: toObjectId(id),
        });
    }

    async updateUser(id: string, body: IUpdateProfileBody) {
        const existedUser = await this.dataServices.users.findById(id);
        if (!existedUser) {
            throw new NotFoundException(`Không tìm thấy user này.`);
        }

        const { birthday } = body;

        await this.dataServices.users.updateById(id, body);
        await this.dataServices.userDetails.updateOne(
            {
                userId: toObjectId(id),
            },
            {
                ...body,
                userId: toObjectId(id),
                birthday: moment(birthday).utc(true).toISOString(),
                dob: moment(birthday).utc(true).format(`MMDD`),
            },
            {
                upsert: true,
            },
        );

        this.elasticsearchService.updateById<User>(ElasticsearchIndex.USER, existedUser._id, {
            id: existedUser._id,
            username: existedUser.username,
            fullName: body.fullName ?? existedUser.fullName,
        });

        return true;
    }

    async activateOrDeactivate(id: string) {
        const existedUser = await this.dataServices.users.findById(id);
        if (!existedUser) throw new NotFoundException(`Không tìm thấy người dùng này.`);

        await this.dataServices.users.updateById(id, {
            active: !existedUser.active,
        });

        return true;
    }

    async getUserStatistic(query?: IGetModUserStatisticQuery) {
        const [status, group] = await Promise.all([this.getUserStatusStatistic(), this.getUserGroupStatistic(query)]);

        return {
            ...status,
            group,
        };
    }

    async getUserStatusStatistic() {
        const [total, totalActive] = await Promise.all([
            (this.dataServices.users as MongoGenericRepository<UserDocument>).getModel().where({}).count(),
            (this.dataServices.users as MongoGenericRepository<UserDocument>)
                .getModel()
                .where({
                    active: true,
                })
                .count(),
        ]);
        return {
            total,
            totalDeactivated: total - totalActive,
            totalActive,
        };
    }

    async getUserGroupStatistic(query?: IGetModUserStatisticQuery) {
        const match = this._buildStatisticQuery(query);
        const userCountByDate = await (this.dataServices.users as MongoGenericRepository<UserDocument>)
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
        return orderBy(userCountByDate, '_id', 'asc');
    }

    _buildStatisticQuery(query: IGetModUserStatisticQuery) {
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

    async updateUserRole(userId: string, body: IUpdateUserRoleBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new NotFoundException(`Không tìm thấy người dùng này.`);
        }

        await this.dataServices.users.updateById(userId, {
            roleId: toObjectId(body.roleId),
        });

        return true;
    }
}
