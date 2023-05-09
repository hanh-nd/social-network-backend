import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from 'src/common/helper';
import { TrimBodyPipe } from 'src/common/pipes';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { ILoginBody, IRegisterBody } from './auth.interface';
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
            return new InternalServerErrorException(error);
        }
    }

    @Post('/register')
    async register(@Body(new TrimBodyPipe()) body: IRegisterBody) {
        try {
            const token = await this.authService.register(body);
            return new SuccessResponse(token);
        } catch (error) {
            this.logger.error(`[AuthService][login] ${error.stack || JSON.stringify(error)}`);
            return new InternalServerErrorException(error);
        }
    }
}
