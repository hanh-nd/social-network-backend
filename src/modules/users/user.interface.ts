import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IChangePasswordBody {
    oldPassword: string;
    password: string;
}

export interface IUpdateProfileBody {
    avatarId?: string;
    coverId?: string;
    phone?: string;
    fullName?: string;
    birthday?: string;
    address?: IAddress;
    describe?: string;
    private?: boolean;
}

export interface IAddress {
    province: string;
    district: string;
    ward: string;
    detail?: string;
}

export interface IRemoveSubscriberBody {
    toRemoveId: string;
}

export interface IGetUserListQuery extends ICommonGetListQuery {}
