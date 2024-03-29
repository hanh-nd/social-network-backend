import { Gender } from 'src/common/constants';
import { Address } from 'src/mongo-schemas';

export interface ILoginBody {
    username: string;
    password: string;
}

export interface IRegisterBody {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone?: string;
    birthday?: Date;
    address?: Address;
    gender?: Gender;
}

export interface IJwtPayload {
    userId: string;
    username: string;
    role: string;
    permissions: string[];
    refreshToken?: string;
}

export interface IForgotPasswordBody {
    email: string;
}

export interface IGetNewPasswordFromUserToken {
    token: string;
    password: string;
}
