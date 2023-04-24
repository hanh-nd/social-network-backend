export interface IChangePasswordBody {
    oldPassword: string;
    password: string;
}

export interface IUpdateProfileBody {
    avatarId?: string;
    coverId?: string;
    phone?: string;
    birthday?: string;
    address?: IAddress;
    describe?: string;
    privacy?: boolean;
}

export interface IAddress {
    province: string;
    district: string;
    ward: string;
    detail?: string;
}
