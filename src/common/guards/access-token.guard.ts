import { ConfigKey } from 'src/common/config';
import { Injectable } from '@nestjs/common';
import { UserToken } from '../interfaces';
import { TokenGuard } from './token.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenGuard extends TokenGuard {
    constructor(private jwtService: JwtService, private configService: ConfigService) {
        super();
    }
    protected verifyToken(token: string): UserToken {
        return this.jwtService.verify(token, {
            secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_SECRET),
        });
    }
}
