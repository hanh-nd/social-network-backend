import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetModGroupStatisticQuery extends ICommonGetListQuery {
    range?: number;
}
