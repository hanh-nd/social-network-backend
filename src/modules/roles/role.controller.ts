import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RoleService } from './role.service';

@Controller('/roles')
export class RoleController {
    constructor(private configService: ConfigService, private roleService: RoleService) {}

    private readonly logger = createWinstonLogger(RoleController.name, this.configService);

    @Get('/')
    async getRoles() {
        try {
            const result = await this.roleService.getRoles();
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[RoleController][getRoles] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
