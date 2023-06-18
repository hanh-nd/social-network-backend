import { ICommonGetListQuery } from 'src/common/interfaces';
import { SystemMessageType } from './sytem-message.constants';

export interface ICreateSystemMessageBody {
    code: string;
    content: string;
    type: SystemMessageType;
}

export interface IGetSystemMessageQuery extends ICommonGetListQuery {}

export interface IUpdateSystemMessageBody {
    content: string;
    type: SystemMessageType;
}
