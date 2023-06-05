import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';

@Injectable()
export class RoleService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async getRoles() {
        return await this.dataServices.roles.findAll({});
    }
}
