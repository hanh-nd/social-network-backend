import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import {
    DEFAULT_ADMIN_PERMISSIONS,
    DEFAULT_MODERATOR_PERMISSIONS,
    DEFAULT_USER_PERMISSIONS,
    RoleName,
} from 'src/common/constants';
import { IDataServices } from 'src/common/repositories/data.service';

@Injectable()
export class RoleSeedService {
    constructor(private readonly dataServices: IDataServices) {}

    @Command({ command: 'create:roles', describe: 'create default roles' })
    async create() {
        const roles = await this.dataServices.roles.bulkCreate([
            {
                name: RoleName.USER,
                permissions: DEFAULT_USER_PERMISSIONS,
            },
            {
                name: RoleName.MODERATOR,
                permissions: DEFAULT_MODERATOR_PERMISSIONS,
            },
            {
                name: RoleName.ADMIN,
                permissions: DEFAULT_ADMIN_PERMISSIONS,
            },
        ]);
        console.log('===== Seeded successfully');
        return roles;
    }
}
