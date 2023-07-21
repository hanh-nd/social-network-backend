import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { toObjectIds, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { FileService } from 'src/modules/files/file.service';
import { GroupDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class GroupResource extends IGenericResource<GroupDocument, UserDocument> {
    constructor(protected dataServices: IDataServices, protected fileService: FileService) {
        super(dataServices);
    }

    async mapToDto(group: GroupDocument, user?: UserDocument): Promise<object> {
        const groupDto = _.cloneDeep(group.toObject());

        groupDto.administrators.forEach((administrator) => {
            if (!ObjectId.isValid(administrator.user) && _.isObject(administrator.user)) {
                const userDto = _.cloneDeep(administrator.user);
                Object.assign(userDto, {
                    numberOfSubscribers: userDto.subscriberIds?.length,
                    numberOfSubscribing: userDto.subscribingIds?.length,
                    isSubscribing: toStringArray(userDto?.subscriberIds).includes(`${user?._id}`),
                    isSelf: `${userDto?._id}` == user._id,
                });

                delete userDto.password;
                delete userDto.blockedIds;
                delete userDto.subscriberIds;
                delete userDto.subscribingIds;
                delete userDto.lastRefreshToken;
                administrator.user = userDto;
            }
        });

        await Promise.all(
            groupDto.pinnedPosts.map(async (groupPost) => {
                const post = groupPost.post;
                if (!post) return groupPost;

                Object.assign(post, {
                    numberOfComments: post.commentIds.length,
                    numberOfReacts: post.reactIds.length,
                    numberOfShares: post.sharedIds.length,
                });

                if (user && post?.author?.subscriberIds) {
                    const isReacted = post.reactIds.map((id) => `${id}`).includes(`${user._id}`);
                    post.isReacted = isReacted;
                    if (isReacted) {
                        const reactionType = await this.dataServices.reactions.findOne({
                            author: user._id,
                            target: post._id,
                            targetType: 'Post',
                        });
                        post.reactionType = reactionType?.type;
                    }
                    const isSubscribing = toStringArray(post.author.subscriberIds).includes(`${user._id}`);
                    if (`${post.author._id}` == `${user._id}`) {
                        post.author.isSelf = true;
                    }
                    post.author.isSubscribing = isSubscribing;
                }

                if (post.pictureIds) {
                    const pictures = await this.fileService.findAll({
                        ids: toObjectIds(post.pictureIds),
                    });

                    Object.assign(post, {
                        medias: pictures,
                    });
                }

                delete post.commentIds;
                delete post.reactIds;
                delete post.sharedIds;
                delete post.isDeletedBySystem;

                return groupPost;
            }),
        );

        const isMember = toStringArray(groupDto.memberIds).includes(`${user?._id}`);

        Object.assign(groupDto, {
            isMember,
        });

        return groupDto;
    }
}
