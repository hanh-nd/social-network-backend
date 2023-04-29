import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportAction } from 'src/common/constants';
import { ReportTarget } from 'src/common/interfaces';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Report, User } from 'src/mongo-schemas';
import { ICreateReportBody } from './report.interface';

@Injectable()
export class ReportService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async create(user: User, targetType: string, target: ReportTarget, body: ICreateReportBody) {
        const existedReport = await this.dataServices.reports.findOne({
            author: user._id,
            targetType,
            target: target._id,
            action: {
                $in: [ReportAction.PENDING, ReportAction.IN_PROGRESS],
            },
        });
        if (existedReport) {
            throw new BadRequestException(`Yêu cầu của bạn đang được xem xét.`);
        }

        const { reportReason } = body;
        const toCreateReportBody: Partial<Report> = {
            author: user._id as unknown,
            target: target._id as unknown,
            targetType: targetType,
            reportReason: reportReason,
            action: ReportAction.PENDING,
        };

        const createdReport = await this.dataServices.reports.create(toCreateReportBody);
        return createdReport._id;
    }
}
