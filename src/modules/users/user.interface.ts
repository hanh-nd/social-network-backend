import { Gender, Relationship } from 'src/common/constants';
import { ICommonGetListQuery } from 'src/common/interfaces';
import { UserEducation, UserWork } from 'src/mongo-schemas';

export interface IChangePasswordBody {
    oldPassword: string;
    password: string;
}

export interface IUpdateProfileBody {
    avatarId?: string;
    coverId?: string;
    phone?: string;
    fullName?: string;
    email?: string;
    birthday?: Date;
    address?: IAddress;
    describe?: string;
    private?: boolean;
    gender?: Gender;
    relationship?: Relationship;
    work?: UserWork;
    education?: UserEducation;
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

export interface IUpdateAlertTimeRange {
    alertRange: number;
}
