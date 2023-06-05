import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetModPostStatisticQuery extends ICommonGetListQuery {
    range?: number;
}
