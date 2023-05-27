import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { capitalize } from 'lodash';
import { toObjectId, toObjectIds } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { IBulkDeleteTagBody, ICreateTagBody, IUpdateTagBody } from './tag.interface';

@Injectable()
export class TagService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

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

    async getTags(userId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }
        const tags = await this.dataServices.tags.findAll({});
        return tags;
    }

    async bulkDeleteTag(body: IBulkDeleteTagBody) {
        const { ids } = body;
        await this.dataServices.tags.bulkDelete({
            id: toObjectIds(ids),
        });
        return true;
    }
}
