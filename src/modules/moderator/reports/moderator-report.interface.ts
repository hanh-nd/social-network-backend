import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetModReportStatisticQuery extends ICommonGetListQuery {
    action?: string;
    range?: number;
}

export interface IUpdateReportBody {
    note: string;
}
