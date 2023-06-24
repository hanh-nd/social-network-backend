import { ICommonGetListQuery } from 'src/common/interfaces';
import { SystemMessageType } from './moderator-system-message.constants';

export interface ICreateSystemMessageBody {
    code: string;
    template: string;
    fullTemplate: string;
    type: SystemMessageType;
}

export interface IGetSystemMessageQuery extends ICommonGetListQuery {}

export interface IUpdateSystemMessageBody {
    template?: string;
    fullTemplate?: string;
    type?: SystemMessageType;
}
