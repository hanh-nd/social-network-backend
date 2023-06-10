import { BadRequestException, Injectable } from '@nestjs/common';
import { capitalize } from 'lodash';
import { toObjectId, toObjectIds } from 'src/common/helper';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Tag } from 'src/mongo-schemas';
import { IBulkDeleteTagBody, ICreateTagBody, IUpdateTagBody } from './tag.interface';

@Injectable()
export class TagService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private redisService: RedisService,
    ) {}

    async createTag(body: ICreateTagBody) {
        const { name, iconId } = body;
        const formattedName = name
            .split(' ')
            .map((name) => capitalize(name.toLowerCase()))
            .join(' ');
        const existedTag = await this.dataServices.tags.findOne({
            name: formattedName,
        });
        if (existedTag) {
            throw new BadRequestException(`Nhãn này đã tồn tại trong hệ thống.`);
        }
        const createdTag = await this.dataServices.tags.create({
            name: formattedName,
            iconId: toObjectId(iconId),
        });

        return createdTag;
    }

    async updateTag(id: string, body: IUpdateTagBody) {
        const existedTag = await this.dataServices.tags.findById(id);
        if (!existedTag) {
            throw new BadRequestException(`Không tìm thấy nhãn.`);
        }

        const { name, iconId } = body;
        const formattedName = name
            .split(' ')
            .map((name) => capitalize(name.toLowerCase()))
            .join(' ');

        const updatedTag = await this.dataServices.tags.updateById(id, {
            name: formattedName,
            iconId: toObjectId(iconId),
        });

        return updatedTag;
    }

    async getTags() {
        const cachedData = await this.redisService.get<Tag[]>(RedisKey.TAGS);
        if (cachedData) return cachedData;
        const tags = await this.dataServices.tags.findAll({}, { lean: true });
        await this.redisService.set(RedisKey.TAGS, tags);
        return tags as Tag[];
    }

    async getTagNames() {
        const cachedData = await this.redisService.get<string[]>(RedisKey.TAG_NAMES);
        if (cachedData) return cachedData;
        const tags = await this.getTags();
        const tagNames = tags.map((tag) => tag.name);
        await this.redisService.set(RedisKey.TAG_NAMES, tagNames);
        return tagNames;
    }

    async getTagIds(names: string[]) {
        const formattedNames = names.map((name) =>
            name
                .split(' ')
                .map((name) => capitalize(name.toLowerCase()))
                .join(' '),
        );

        const tags = await this.getTags();
        const filteredTags = tags.filter((t: Tag) => formattedNames.includes(t.name));
        return filteredTags.map((tag) => tag._id);
    }

    async bulkDeleteTag(body: IBulkDeleteTagBody) {
        const { ids } = body;
        await this.dataServices.tags.bulkDelete({
            id: toObjectIds(ids),
        });
        return true;
    }
}
