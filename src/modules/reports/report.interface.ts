import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetReportListQuery extends ICommonGetListQuery {
    action?: string;
    username?: string;
    targetType?: string;
}

export interface ICreateReportBody {
    reportReason: string;
}
