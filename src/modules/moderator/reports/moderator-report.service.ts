import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ReportAction, ReportTargetType } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { IGetReportListQuery } from 'src/modules/reports/report.interface';
import { ModeratorPostService } from '../posts/moderator-post.service';
import { ModeratorUserService } from '../users/moderator-user.service';
import { IUpdateReportBody } from './moderator-report.interface';

@Injectable()
export class ModeratorReportService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
        private moderatorPostService: ModeratorPostService,
        private moderatorUserService: ModeratorUserService,
    ) {}

    async getReportList(query?: IGetReportListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = await this._buildSearchQuery(query);
        return await this.dataServices.reports.findAll(where, {
            populate: [
                {
                    path: 'author',
                    select: 'id avatarId fullName username',
                },
                {
                    path: 'target',
                },
            ],
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
        });
    }

    async _buildSearchQuery(query: IGetReportListQuery) {
        const { action, keyword, targetType } = query;

        const where: any = {};

        if (action) {
            where.action = action;
        }

        if (targetType) {
            where.targetType = targetType;
        }

        if (keyword?.trim()) {
            const user = await this.dataServices.users.findOne(
                {
                    username: keyword?.trim(),
                },
                {
                    select: ['_id'],
                },
            );
            where[`$or`] = [
                {
                    _id: toObjectId(keyword),
                },
                {
                    author: toObjectId(user?._id),
                },
            ];
        }

        return where;
    }

    async acceptReport(id: string) {
        const existedReport = await this.dataServices.reports.findById(id);
        if (!existedReport) throw new NotFoundException(`Không tìm thấy báo cáo này.`);

        switch (existedReport.targetType) {
            case ReportTargetType.USER:
                await this.moderatorUserService.activateOrDeactivate(existedReport.target as unknown as string);
                break;
            case ReportTargetType.POST:
                await this.moderatorPostService.deletePost(existedReport.target as unknown as string);
                break;
        }

        await this.dataServices.reports.updateById(id, {
            action: ReportAction.RESOLVED,
        });
        return true;
    }

    async rejectReport(id: string) {
        await this.dataServices.reports.updateById(id, {
            action: ReportAction.REJECTED,
        });
        return true;
    }

    async updateReport(id: string, body: IUpdateReportBody) {
        const existedReport = await this.dataServices.reports.findById(id);
        if (!existedReport) throw new NotFoundException(`Không tìm thấy báo cáo này.`);

        await this.dataServices.reports.updateById(id, body);
        return true;
    }
}
