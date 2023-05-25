import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ReactionType, ReactionTypePoint } from 'src/common/constants';
import { ReactionTarget } from 'src/common/interfaces';
import { IDataServices } from 'src/common/repositories/data.service';
import { MongoGenericRepository } from 'src/common/repositories/mongo/mongo-generic.repository';
import { IDataResources } from 'src/common/resources/data.resource';
import { Comment, Reaction, ReactionDocument, User, UserDocument } from 'src/mongo-schemas';
import { Post } from './../../mongo-schemas/post.schema';
import { ICreateReactionBody, IGetReactionListQuery } from './reaction.interface';

@Injectable()
export class ReactionService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async getReactions(user: User, targetType: string, target: Post | Comment, query: IGetReactionListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;

        const reactions = await this.dataServices.reactions.findAll(
            {
                targetType: targetType,
                target: target._id,
            },
            {
                populate: ['author', 'target'],
                skip: skip,
                limit: +limit,
            },
        );
        const reactionDtos = await this.dataResources.reactions.mapToDtoList(reactions, user as UserDocument);
        return reactionDtos;
    }

    async react(user: User, targetType: string, target: ReactionTarget, body: ICreateReactionBody) {
        const existedReaction = await this.dataServices.reactions.findOne({
            author: user._id,
            target: target._id,
            targetType: targetType,
        });
        if (existedReaction) {
            throw new BadRequestException(`Bạn đã tương tác trước đó.`);
        }

        const { type } = body;
        const toCreateReactionBody: Partial<Reaction> = {
            author: user._id as unknown,
            target: target._id as unknown,
            targetType: targetType,
            type: type as ReactionType,
        };
        await this.dataServices.reactions.create(toCreateReactionBody);
        return ReactionTypePoint[type] || 0;
    }

    async undoReact(user: User, targetType: string, target: ReactionTarget) {
        const reactionTypeCount = await (this.dataServices.reactions as MongoGenericRepository<ReactionDocument>)
            .getModel()
            .aggregate([
                {
                    $match: {
                        author: user._id,
                        target: target._id,
                        targetType: targetType,
                        deletedAt: null,
                    },
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                    },
                },
            ]);
        const toDecreasePoints = reactionTypeCount.reduce((point: number, item: { _id: string; count: number }) => {
            return (point += (ReactionTypePoint[item._id] || 0) * item.count);
        }, 0);

        await this.dataServices.reactions.bulkDelete({
            author: user._id,
            target: target._id,
            targetType: targetType,
        });

        return toDecreasePoints;
    }
}
