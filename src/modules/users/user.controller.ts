import { Body, Controller, Get, InternalServerErrorException, Param, Patch, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { IChangePasswordBody, IRemoveSubscriberBody, IUpdateProfileBody } from './user.interface';
import { UserService } from './user.service';

@Controller('/users/')
export class UserController {
    constructor(private configService: ConfigService, private userService: UserService) {}

    private readonly logger = createWinstonLogger(UserController.name, this.configService);

    @Get('/me')
    @UseGuards(AccessTokenGuard)
    async getLoginUserProfile(@LoginUser() loginUser) {
        try {
            const user = await this.userService.getUserProfile(loginUser.userId);
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`[getLoginUserProfile] ${error.stack || JSON.stringify(error)}`);
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
            this.logger.error(`[changeUserPassword] ${error.stack || JSON.stringify(error)}`);
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
            this.logger.error(`[updateProfile] ${error.stack || JSON.stringify(error)}`);
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
            this.logger.error(`[getSubscribers] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/subscribers/remove')
    @UseGuards(AccessTokenGuard)
    async removeSubscribers(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IRemoveSubscriberBody) {
        try {
            const result = await this.userService.removeSubscribers(loginUser.userId, body.toRemoveId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[removeSubscribers] ${error.stack || JSON.stringify(error)}`);
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
            this.logger.error(`[getBlockedList] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/subscribing')
    @UseGuards(AccessTokenGuard)
    async getSubscribing(@LoginUser() loginUser) {
        try {
            const result = await this.userService.getSubscribing(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSubscribing] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/:id/files')
    @UseGuards(AccessTokenGuard)
    async getUserFiles(@Param('id') id: string) {
        try {
            const result = await this.userService.getUserFiles(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserFiles] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    @UseGuards(AccessTokenGuard)
    async getUserInformation(@Param('id') id: string) {
        try {
            const user = await this.userService.getUserProfile(id);
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`[getUserInformation] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/:id/subscribe')
    @UseGuards(AccessTokenGuard)
    async subscribeOrUnsubscribeUser(@LoginUser() loginUser, @Param('id') targetUserId: string) {
        try {
            const result = await this.userService.subscribeOrUnsubscribeUser(loginUser.userId, targetUserId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[subscribeOrUnsubscribeUser] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/:id/block')
    @UseGuards(AccessTokenGuard)
    async blockOrUnblockUser(@LoginUser() loginUser, @Param('id') targetUserId: string) {
        try {
            const result = await this.userService.blockOrUnblockUser(loginUser.userId, targetUserId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[blockOrUnblockUser] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
