import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import {
    DEFAULT_ADMIN_PERMISSIONS,
    DEFAULT_MODERATOR_PERMISSIONS,
    DEFAULT_USER_PERMISSIONS,
    RoleName,
} from 'src/common/constants';
import { IDataServices } from 'src/common/repositories/data.service';

const data = [
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
];

@Injectable()
export class RoleSeedService {
    constructor(private readonly dataServices: IDataServices) {}

    @Command({ command: 'create:roles', describe: 'create default roles' })
    async create() {
        for (const name of Object.values(RoleName)) {
            const dataValue = data.find((d) => d.name === name);
            if (!dataValue) continue;

            const permissions = dataValue.permissions;
            await this.dataServices.roles.updateOne(
                {
                    name,
                },
                {
                    name,
                    permissions,
                },
                {
                    upsert: true,
                },
            );
        }
        console.log('===== Seeded successfully');
        return;
    }
}
