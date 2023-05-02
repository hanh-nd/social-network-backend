import { Body, Controller, InternalServerErrorException, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard, RefreshTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { IForgotPasswordBody, IGetNewPasswordFromUserToken, ILoginBody, IRegisterBody } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('/')
export class AuthController {
    constructor(private configService: ConfigService, private authService: AuthService) {}
    private readonly logger = createWinstonLogger(AuthController.name, this.configService);

    @Post('/login')
    async login(@Body(new TrimBodyPipe()) body: ILoginBody) {
        try {
            const token = await this.authService.login(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[login] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/register')
    async register(@Body(new TrimBodyPipe()) body: IRegisterBody) {
        try {
            const token = await this.authService.register(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[register] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/forgot-password')
    async forgotPassword(@Body(new TrimBodyPipe()) body: IForgotPasswordBody) {
        try {
            const result = await this.authService.forgotPassword(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[forgotPassword] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/new-password')
    async getNewPasswordFromUserToken(@Body(new TrimBodyPipe()) body: IGetNewPasswordFromUserToken) {
        try {
            const token = await this.authService.getNewPasswordFromUserToken(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[getNewPasswordFromUserToken] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/refresh-token')
    @UseGuards(RefreshTokenGuard)
    async refreshToken(@Req() req) {
        try {
            const token = await this.authService.refreshToken(req.user.userId, req.user.refreshToken);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[refreshToken] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/logout')
    @UseGuards(AccessTokenGuard)
    async logout(@LoginUser() loginUser) {
        try {
            const result = await this.authService.logout(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[logout] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
