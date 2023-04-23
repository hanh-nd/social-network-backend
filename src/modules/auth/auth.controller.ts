import { Body, Controller, InternalServerErrorException, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { TrimBodyPipe } from 'src/common/pipes';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { IForgotPasswordBody, IGetNewPasswordFromUserToken, ILoginBody, IRegisterBody } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('/')
export class AuthController {
    constructor(private configService: ConfigService, private authService: AuthService) {}
    private readonly logger = createWinstonLogger(AuthController.name, 'auth', this.configService);

    @Post('/login')
    async login(@Body(new TrimBodyPipe()) body: ILoginBody) {
        try {
            const token = await this.authService.login(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[AuthService][login] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/register')
    async register(@Body(new TrimBodyPipe()) body: IRegisterBody) {
        try {
            const token = await this.authService.register(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[AuthService][register] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/forgot-password')
    async forgotPassword(@Body(new TrimBodyPipe()) body: IForgotPasswordBody) {
        try {
            const result = await this.authService.forgotPassword(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[AuthService][forgotPassword] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/new-password')
    async getNewPasswordFromUserToken(@Body(new TrimBodyPipe()) body: IGetNewPasswordFromUserToken) {
        try {
            const token = await this.authService.getNewPasswordFromUserToken(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[AuthService][getNewPasswordFromUserToken] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/refresh-token')
    @UseGuards(RefreshTokenGuard)
    async refreshToken(@Req() req) {
        try {
            const token = await this.authService.refreshToken(req.loginUser.userId, req.refreshToken);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[AuthService][refreshToken] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
