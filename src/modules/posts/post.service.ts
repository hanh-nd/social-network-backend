import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Privacy } from 'src/common/constants';
import { toObjectId, toObjectIds } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Post } from 'src/mongo-schemas';
import { FileService } from '../files/file.service';
import { ICreatePostBody, IUpdatePostBody } from './post.interface';

@Injectable()
export class PostService {
    constructor(
        private dataService: IDataServices,
        private dataResource: IDataResources,
        private fileService: FileService,
    ) {}

    async createNewPost(userId: string, body: ICreatePostBody) {
        const { content, privacy = Privacy.PUBLIC, discussedInId, pictureIds = [], videoIds = [] } = body;

        const author = await this.dataService.users.findById(userId);
        if (!author) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện tác vụ này.`);
        }

        const createPostBody: Partial<Post> = {
            author: author._id,
            content,
            privacy,
            commentIds: [],
            reactIds: [],
            sharedIds: [],
            pictureIds: toObjectIds(pictureIds),
            videoIds: toObjectIds(videoIds),
            point: 0,
        };

        if (discussedInId) {
            const discussedInUser = await this.dataService.users.findById(discussedInId);
            if (!discussedInUser) {
                throw new BadRequestException(`Không tồn tại tường người dùng.`);
            }
            createPostBody.discussedIn = discussedInUser._id;
        }

        const createdPost = await this.dataService.posts.create(createPostBody);
        return createdPost._id;
    }

    async getUserPosts(userId: string) {
        const posts = await this.dataService.posts.findAll(
            {
                author: toObjectId(userId),
                discussedIn: null,
            },
            {
                sort: [['createdAt', 'desc']],
                populate: ['author'],
            },
        );
        const postDtos = await this.dataResource.posts.mapToDtoList(posts);
        return postDtos;
    }

    async getDetail(id: string) {
        const post = await this.dataService.posts.findById(id, {
            populate: ['author', 'discussedIn'],
        });
        if (!post) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        const postDto = await this.dataResource.posts.mapToDto(post);
        return postDto;
    }

    async updateUserPost(userId: string, postId: string, body: IUpdatePostBody) {
        const { content, privacy, pictureIds, videoIds } = body;
        const existedPost = await this.dataService.posts.findOne({
            author: toObjectId(userId),
            _id: toObjectId(postId),
        });
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        const toUpdateBody: Partial<Post> = { content, privacy };
        if (pictureIds) {
            toUpdateBody.pictureIds = toObjectIds(pictureIds);
        }

        if (videoIds) {
            toUpdateBody.videoIds = toObjectIds(videoIds);
        }

        await this.dataService.posts.updateById(existedPost._id, toUpdateBody);
        return true;
    }

    async deleteUserPost(userId: string, postId: string) {
        const existedPost = await this.dataService.posts.findOne({
            author: toObjectId(userId),
            _id: toObjectId(postId),
        });
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }
        await this.dataService.posts.deleteById(existedPost._id);
        return true;
    }
}
