import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, OrderDirection } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Comment, Post, User, UserDocument } from 'src/mongo-schemas';
import { ICreateCommentBody, IGetCommentListQuery, IUpdateCommentBody } from './comment.interface';
@Injectable()
export class CommentService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async getCommentsInPost(user: User, post: Post, query: IGetCommentListQuery) {
        const {
            page = DEFAULT_PAGE_VALUE,
            limit = DEFAULT_PAGE_LIMIT,
            orderBy = 'createdAt',
            orderDirection = OrderDirection.ASC,
        } = query;
        const skip = (+page - 1) * +limit;

        const comments = await this.dataServices.comments.findAll(
            {
                post: post._id,
            },
            {
                populate: ['author', 'post'],
                sort: [[orderBy, orderDirection]],
                skip: skip,
                limit: +limit,
            },
        );

        const commentDtos = await this.dataResources.comments.mapToDtoList(comments, user as UserDocument);
        return commentDtos;
    }

    async createCommentInPost(author: User, post: Post, body: ICreateCommentBody) {
        const { content, videoId, pictureId } = body;
        const createCommentBody: Partial<Comment> = {
            author: toObjectId(author._id) as unknown,
            post: toObjectId(post._id) as unknown,
            content: content,
            pictureId: toObjectId(pictureId),
            videoId: toObjectId(videoId),
            reactIds: [],
            point: 0,
        };
        const createdComment = await this.dataServices.comments.create(createCommentBody);
        return createdComment;
    }

    async updateCommentInPost(commentId: string, author: User, post: Post, body: IUpdateCommentBody) {
        const { pictureId, videoId } = body;
        const toUpdateComment = await this.dataServices.comments.findOne({
            _id: commentId,
            author: author._id,
            post: post._id,
        });
        if (!toUpdateComment) {
            throw new BadRequestException(`Không tìm thấy bình luận này.`);
        }

        await this.dataServices.comments.updateById(toUpdateComment._id, {
            ...body,
            pictureId: toObjectId(pictureId),
            videoId: toObjectId(videoId),
        });
        return toUpdateComment._id;
    }

    async deleteCommentInPost(commentId: string, author: User, post: Post) {
        const toDeleteComment = await this.dataServices.comments.findOne({
            _id: commentId,
            author: author._id,
            post: post._id,
        });
        if (!toDeleteComment) {
            throw new BadRequestException(`Không tìm thấy bình luận này.`);
        }

        await this.dataServices.comments.deleteById(toDeleteComment._id);
        return toDeleteComment._id;
    }
}
