import { ForbiddenException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { toObjectId, toObjectIds, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Chat, User } from 'src/mongo-schemas';
import { MessageService } from '../messages/message.service';
import { ICreateReportBody } from '../reports/report.interface';
import { ChatType } from './chat.constants';
import { ICreateChatBody, ICreateMessageBody, IGetMessageListQuery, IUpdateChatBody } from './chat.interfaces';

@Injectable()
export class ChatService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private messageService: MessageService,
    ) {}

    async createChat(userId: string, body: ICreateChatBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { name, members = [], type = ChatType.PRIVATE } = body;

        if (type === ChatType.PRIVATE) {
            // tìm đoạn chat đã tồn tại
            const existedChat = await this.dataServices.chats.findOne({
                type: ChatType.PRIVATE,
                members: {
                    $in: toObjectIds(members),
                },
            });

            if (existedChat) {
                const { deletedFor = [] } = existedChat;
                if (toStringArray(deletedFor as unknown as ObjectId[]).includes(`${user._id}`)) {
                    _.remove(deletedFor, (id) => `${id}` == `${user._id}`);
                    await this.dataServices.chats.updateById(existedChat._id, {
                        deletedFor,
                    });
                }
                return existedChat._id;
            }
        }

        const toCreateChatBody: Partial<Chat> = {
            name,
            members: toObjectIds(members) as unknown as User[],
            type,
            administrators: [],
        };

        if (type === ChatType.PRIVATE) {
            const administrators = members.map((user: string) => {
                return {
                    user: toObjectId(user) as unknown,
                    isOwner: false,
                };
            });
            toCreateChatBody.administrators.push(...administrators);
        } else {
            toCreateChatBody.administrators.push({
                user: toObjectId(user._id) as unknown,
                isOwner: true,
            });
        }

        if (!name) {
            const users = await this.dataServices.users.findAll(
                {
                    _id: toObjectIds(members),
                },
                {
                    select: 'fullName',
                },
            );
            const userNames = users.map((user) => user.fullName);
            const isTruncated = userNames.length > 2;
            const generatedName = userNames.slice(0, 2).join(`, `) + (isTruncated ? '...' : '');
            toCreateChatBody.name = generatedName;
        }
        const createdChat = await this.dataServices.chats.create(toCreateChatBody);
        return createdChat._id;
    }

    async getUserChats(userId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chats = await this.dataServices.chats.findAll(
            {
                members: toObjectId(user._id),
                deletedFor: {
                    $ne: toObjectId(user._id),
                },
            },
            {
                populate: [
                    {
                        path: 'members',
                        select: '_id avatarId fullName',
                    },
                ],
            },
        );

        const chatDtos = await this.dataResources.chats.mapToDtoList(chats, user);
        return chatDtos;
    }

    async updateChat(userId: string, chatId: string, body: IUpdateChatBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Không tìm thấy đoạn hội thoại.`);
        }

        const { name, avatarId } = body;
        const toUpdateChatBody: Partial<Chat> = {};
        if (name) {
            toUpdateChatBody.name = name;
        }

        if (avatarId) {
            toUpdateChatBody.avatarId = toObjectId(avatarId);
        }

        await this.dataServices.chats.updateById(chat._id, toUpdateChatBody);
        return true;
    }

    async makeOrRemoveAdministrator(userId: string, chatId: string, targetId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const targetUser = await this.dataServices.users.findById(targetId);
        if (!targetUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            'administrators.user': toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        if (chat.type === ChatType.PRIVATE) {
            // Nhóm chat riêng không sử dụng đến admin
            return true;
        }

        const { administrators = [], blockedIds = [] } = chat;
        const targetUserBlock = blockedIds.find((id) => `${id}` == targetId);
        if (targetUserBlock) {
            throw new ForbiddenException(`Người dùng này đang trong danh sách bị chặn.`);
        }

        const targetUserAdmin = administrators.find((admin) => `${admin.user}` == targetId);
        if (targetUserAdmin) {
            await this.removeAdministrator(user, chat, targetUser);
        } else {
            await this.makeAdministrator(user, chat, targetUser);
        }

        return true;
    }

    private async makeAdministrator(user: User, chat: Chat, targetUser: User) {
        const { administrators = [] } = chat;
        administrators.push({
            user: toObjectId(targetUser._id) as unknown,
            isOwner: false,
        });

        await this.dataServices.chats.updateById(chat._id, {
            administrators,
        });

        return true;
    }

    private async removeAdministrator(user: User, chat: Chat, targetUser: User) {
        const { administrators = [] } = chat;
        const targetUserAdmin = administrators.find((admin) => `${admin.user}` == `${targetUser._id}`);
        if (targetUserAdmin.isOwner) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này với người sáng lâp.`);
        }

        _.remove(administrators, (admin) => `${admin.user}` == `${targetUser._id}`);

        await this.dataServices.chats.updateById(chat._id, {
            administrators,
        });

        return true;
    }

    async addOrRemoveMember(userId: string, chatId: string, targetId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const targetUser = await this.dataServices.users.findById(targetId);
        if (!targetUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            'administrators.user': toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        if (chat.type === ChatType.PRIVATE) {
            // Nhóm chat riêng không sử dụng đến admin
            return true;
        }

        const { members = [], blockedIds = [] } = chat;
        const targetUserBlock = blockedIds.find((id) => `${id}` == targetId);
        if (targetUserBlock) {
            throw new ForbiddenException(`Người dùng này đang trong danh sách bị chặn.`);
        }

        const targetUserAdmin = members.find((member) => `${member}` == targetId);
        if (targetUserAdmin) {
            await this.addMember(user, chat, targetUser);
        } else {
            await this.removeMember(user, chat, targetUser);
        }

        return true;
    }

    private async addMember(user: User, chat: Chat, targetUser: User) {
        const { members = [] } = chat;
        members.push(toObjectId(targetUser._id) as unknown);

        await this.dataServices.chats.updateById(chat._id, {
            members,
        });

        return true;
    }

    private async removeMember(user: User, chat: Chat, targetUser: User) {
        const { administrators = [], members = [] } = chat;
        const targetUserAdmin = administrators.find((admin) => `${admin.user}` == `${targetUser._id}`);
        if (targetUserAdmin.isOwner) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này với người sáng lập.`);
        }

        _.remove(members, (member) => `${member}` == `${targetUser._id}`);
        _.remove(administrators, (admin) => `${admin.user}` == `${targetUser._id}`);

        await this.dataServices.chats.updateById(chat._id, {
            members,
            administrators,
        });

        return true;
    }

    async blockOrUnblockMember(userId: string, chatId: string, targetId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const targetUser = await this.dataServices.users.findById(targetId);
        if (!targetUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            'administrators.user': toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { members = [], blockedIds = [] } = chat;
        const targetUserMember = members.find((id) => `${id}` == targetId);
        if (targetUserMember) {
            throw new ForbiddenException(`Người dùng này không phải thành viên đoạn chat.`);
        }

        const targetUserBlock = blockedIds.find((id) => `${id}` == targetId);
        if (targetUserBlock) {
            await this.unblockMember(user, chat, targetUser);
        } else {
            await this.blockMember(user, chat, targetUser);
        }

        return true;
    }

    private async blockMember(user: User, chat: Chat, targetUser: User) {
        const { blockedIds = [], administrators = [] } = chat;
        const targetUserAdmin = administrators.find((admin) => `${admin.user}` == `${targetUser._id}`);
        if (targetUserAdmin.isOwner) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này với người sáng lập.`);
        }

        blockedIds.push(toObjectId(targetUser._id) as unknown);
        _.remove(administrators, (admin) => `${admin.user}` == `${targetUser._id}`);

        await this.dataServices.chats.updateById(chat._id, {
            blockedIds,
            administrators,
        });

        return true;
    }

    private async unblockMember(user: User, chat: Chat, targetUser: User) {
        const { blockedIds = [] } = chat;

        _.remove(blockedIds, (id) => `${id}` == `${targetUser._id}`);

        await this.dataServices.chats.updateById(chat._id, {
            blockedIds,
        });

        return true;
    }

    async deleteChat(userId: string, chatId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
            deletedFor: {
                $ne: toObjectId(user._id),
            },
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { deletedFor = [] } = chat;
        deletedFor.push(toObjectId(userId) as unknown);

        await this.dataServices.chats.updateById(chat._id, {
            deletedFor,
        });

        return true;
    }

    async createMessage(userId: string, chatId: string, body: ICreateMessageBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const message = await this.messageService.createMessage(user, chat, body);
        return { chat, message };
    }

    async getMessages(userId: string, chatId: string, query: IGetMessageListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const messages = await this.messageService.getMessages(user, chat, query);
        return messages;
    }

    async recallMessage(userId: string, chatId: string, messageId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const updatedMessage = await this.messageService.recallMessage(user, chat, messageId);
        return { chat, message: updatedMessage };
    }

    async deleteMessage(userId: string, chatId: string, messageId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        await this.messageService.deleteMessage(user, chat, messageId);
        return true;
    }

    async reportMessage(userId: string, chatId: string, messageId: string, body: ICreateReportBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const createdReportId = await this.messageService.reportMessage(user, chat, messageId, body);
        return createdReportId;
    }

    async getChatDetail(userId: string, chatId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne(
            {
                _id: toObjectId(chatId),
                members: toObjectId(userId),
            },
            {
                populate: [
                    {
                        path: 'members',
                        select: '_id fullName avatarId',
                    },
                ],
            },
        );
        if (!chat) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chatDto = await this.dataResources.chats.mapToDto(chat, user);
        return chatDto;
    }

    async leaveChat(userId: string, chatId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const chat = await this.dataServices.chats.findOne({
            _id: toObjectId(chatId),
            members: toObjectId(userId),
        });
        if (!chat) {
            throw new ForbiddenException(`Bạn không phải thành viên đoạn chat này.`);
        }

        const { members = [] } = chat;
        _.remove(members, (id) => id == `${user._id}`);

        await this.dataServices.chats.updateById(chat._id, {
            members,
        });

        return true;
    }
}
