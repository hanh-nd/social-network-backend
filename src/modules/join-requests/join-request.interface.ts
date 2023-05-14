import { SubscribeRequestStatus } from 'src/common/constants';

export interface ICreateJoinRequestBody {
    status: SubscribeRequestStatus;
}

export interface IUpdateJoinRequestBody {
    status: SubscribeRequestStatus;
}
