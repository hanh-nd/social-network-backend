import { OrderBy, OrderDirection } from './constants';

export interface ICommonGetListQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  orderDirection?: OrderDirection;
  orderBy?: OrderBy;
}

export interface UserToken {
  sub: string;
  username: string;
  refreshToken?: string;
}

export interface RequestWithUser extends Request {
  user: UserToken;
}
