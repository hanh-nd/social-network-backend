import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigKey } from 'src/common/config';
import { IJwtPayload } from 'src/modules/auth/auth.interface';
import { TokenGuard } from './token.guard';

@Injectable()
export class AccessTokenGuard extends TokenGuard {
    constructor(private jwtService: JwtService, private configService: ConfigService) {
        super();
    }
    protected verifyToken(token: string): IJwtPayload {
        return this.jwtService.verify<IJwtPayload>(token, {
            secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_SECRET),
        });
    }
}
