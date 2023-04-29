import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetReportListQuery extends ICommonGetListQuery {}

export interface ICreateReportBody {
    reportReason: string;
}
