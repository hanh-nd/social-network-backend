import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ConfigKey } from 'src/common/config';
import { IJwtPayload } from 'src/modules/auth/auth.interface';
import { TokenGuard } from './token.guard';

@Injectable()
export class RefreshTokenGuard extends TokenGuard {
    constructor(private jwtService: JwtService, private configService: ConfigService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = this.getRequest(context);

        try {
            const token = this.getToken(request);
            const user = this.verifyToken(token);
            user.refreshToken = token;
            request.user = user;
            return true;
        } catch (e) {
            // return false or throw a specific error if desired
            return false;
        }
    }
    protected verifyToken(token: string): IJwtPayload {
        return this.jwtService.verify<IJwtPayload>(token, {
            secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_TOKEN_SECRET),
        });
    }
}
