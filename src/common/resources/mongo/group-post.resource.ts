import * as _ from 'lodash';
import { toObjectIds, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { FileService } from 'src/modules/files/file.service';
import { GroupPostDocument, User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class GroupPostResource extends IGenericResource<GroupPostDocument, UserDocument> {
    constructor(protected dataServices: IDataServices, protected fileService: FileService) {
        super(dataServices);
    }

    async mapToDto(groupPost: GroupPostDocument, user?: User): Promise<object> {
        const groupPostDto = _.cloneDeep(groupPost.toObject());
        const isAnonymous = groupPostDto.post?.isAnonymous ?? false;

        if (_.isObject(groupPostDto?.post?.author)) {
            groupPostDto.post.author = _.pick(groupPostDto.post.author, [
                '_id',
                'username',
                'avatarId',
                'fullName',
                'subscriberIds',
            ]);
        }

        if (_.isObject(groupPostDto?.post?.postShared)) {
            groupPostDto.post.postShared = _.pick(groupPostDto.post.postShared, [
                '_id',
                'author',
                'content',
                'privacy',
                'pictureIds',
                'videoIds',
                'createdAt',
                'updatedAt',
                'deletedAt',
            ]);

            if (_.isObject(groupPostDto.post?.postShared?.author)) {
                groupPostDto.post.postShared.author = _.pick(groupPostDto.post.postShared.author, [
                    '_id',
                    'username',
                    'avatarId',
                    'fullName',
                ]);
            }
        }

        Object.assign(groupPostDto.post, {
            numberOfComments: groupPostDto.post.commentIds.length,
            numberOfReacts: groupPostDto.post.reactIds.length,
            numberOfShares: groupPostDto.post.sharedIds.length,
        });

        if (groupPostDto?.post?.pictureIds) {
            const pictures = await this.fileService.findAll({
                ids: toObjectIds(groupPostDto?.post.pictureIds),
            });

            Object.assign(groupPostDto.post, {
                medias: pictures,
            });
        }

        if (user) {
            const isReacted = groupPostDto.post.reactIds.map((id) => `${id}`).includes(`${user._id}`);
            groupPostDto.post.isReacted = isReacted;
            if (isReacted) {
                const reactionType = await this.dataServices.reactions.findOne({
                    author: user._id,
                    target: groupPostDto.post._id,
                    targetType: 'Post',
                });
                groupPostDto.post.reactionType = reactionType?.type;
            }
            const isSubscribing = toStringArray(groupPostDto.post.author.subscriberIds).includes(`${user._id}`);
            if (`${groupPostDto.post.author._id}` == `${user._id}`) {
                groupPostDto.post.author.isSelf = true;
            }
            groupPostDto.post.author.isSubscribing = isSubscribing;
        }

        if (isAnonymous && !groupPostDto?.post?.author?.isSelf) {
            _.set(groupPostDto, 'post.author', {
                fullName: `Người dùng ẩn danh`,
            });
        }

        delete groupPostDto.post.commentIds;
        delete groupPostDto.post.reactIds;
        delete groupPostDto.post.sharedIds;
        delete groupPostDto.post.isDeletedBySystem;

        return groupPostDto;
    }
}
