import { Body, Controller, Get, InternalServerErrorException, Patch, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { TrimBodyPipe } from 'src/common/pipes';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { IChangePasswordBody, IRemoveSubscriberBody, IUpdateProfileBody } from './user.interface';
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

    @Patch('/change-password')
    @UseGuards(AccessTokenGuard)
    async changeUserPassword(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IChangePasswordBody) {
        try {
            const result = await this.userService.changeUserPassword(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[UserController][changeUserPassword] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/update-profile')
    @UseGuards(AccessTokenGuard)
    async updateProfile(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IUpdateProfileBody) {
        try {
            const result = await this.userService.updateProfile(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[UserController][updateProfile] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/subscribers')
    @UseGuards(AccessTokenGuard)
    async getSubscribers(@LoginUser() loginUser) {
        try {
            const result = await this.userService.getSubscribers(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[UserController][getSubscribers] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/subscribers/remove')
    @UseGuards(AccessTokenGuard)
    async removeSubscribers(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IRemoveSubscriberBody) {
        try {
            const result = await this.userService.removeSubscribers(loginUser.userId, body.toRemoveId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[UserController][removeSubscribers] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/blocked-list')
    @UseGuards(AccessTokenGuard)
    async getBlockedList(@LoginUser() loginUser) {
        try {
            const result = await this.userService.getBlockedList(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[UserController][getBlockedList] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
