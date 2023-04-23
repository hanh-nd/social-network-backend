import { Controller, Get, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { UserService } from './user.service';

@Controller('/users/')
export class UserController {
    constructor(private configService: ConfigService, private userService: UserService) {}

    private readonly logger = createWinstonLogger(UserController.name, 'users', this.configService);

    @Get('/me')
    @UseGuards(AccessTokenGuard)
    async getLoginUserProfile(@LoginUser() loginUser) {
        try {
            const user = await this.userService.getLoginUserProfile(loginUser.userId);
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`[UserController][getLoginUserProfile] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
