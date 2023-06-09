import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE } from 'src/common/constants';
import { ItemAlreadyExistedException } from 'src/common/exception/item-already-existed.exception';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { SystemMessage, User } from 'src/mongo-schemas';
import {
    ICreateSystemMessageBody,
    IGetSystemMessageQuery,
    IUpdateSystemMessageBody,
} from './system-message.interfaces';

@Injectable()
export class SystemMessageService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async createMessage(body: ICreateSystemMessageBody) {
        const { code } = body;
        const existedSystemMessage = await this.dataServices.systemMessages.findOne({
            code,
        });
        if (existedSystemMessage) {
            throw new ItemAlreadyExistedException(`Tin nhắn đã tồn tại trong hê thống`);
        }

        const createdMessage = await this.dataServices.systemMessages.create(body);
        return createdMessage;
    }

    async getMessageList(query?: IGetSystemMessageQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = this.buildWhereQuery(query);

        const systemMessages = await this.dataServices.systemMessages.findAll(where, {
            skip: skip,
            limit: +limit,
        });

        return systemMessages;
    }

    private buildWhereQuery(query?: IGetSystemMessageQuery) {
        const { keyword } = query;

        const where: any = {};

        if (keyword?.trim()) {
            where.code = keyword.trim();
        }

        return where;
    }

    async updateMessage(id: string, body: IUpdateSystemMessageBody) {
        const existedSystemMessage = await this.dataServices.systemMessages.findById(id);
        if (existedSystemMessage) {
            throw new NotFoundException(`Tin nhắn không tồn tại trong hê thống`);
        }

        const updatedMessage = await this.dataServices.systemMessages.updateById(id, body);
        return updatedMessage;
    }

    async getMessageByCode(code: string) {
        return await this.dataServices.systemMessages.findOne({
            code,
        });
    }

    async deleteMessage(id: string) {
        await this.dataServices.systemMessages.deleteById(id);
        return true;
    }

    async buildMessageContent(
        message: SystemMessage,
        parameters: object = {},
        isFull = false,
        receivedUser: Partial<User> = {},
    ) {
        const { template = '', fullTemplate = '' } = message;
        const { fullName = '', email = '', username = '' } = receivedUser;
        Object.assign(parameters, {
            _fullName: fullName,
            _email: email,
            _username: username,
        });
        let content = isFull ? fullTemplate : template;
        for (const key in parameters) {
            const val = parameters[key];

            content = content.replace(`@{${key}}`, val);
        }

        return content;
    }
}
