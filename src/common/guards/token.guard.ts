import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserToken } from '../interfaces';

export abstract class TokenGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = this.getRequest(context);

        try {
            const token = this.getToken(request);
            const user = this.verifyToken(token);
            request.user = user;
            return true;
        } catch (e) {
            // return false or throw a specific error if desired
            return false;
        }
    }

    protected getRequest(context: ExecutionContext) {
        return context.switchToHttp().getRequest();
    }

    protected getToken(request: {
        headers: Record<string, string | string[]>;
    }): string {
        const authorization = request.headers['authorization'];
        if (!authorization || Array.isArray(authorization)) {
            throw new Error('Invalid Authorization Header');
        }
        const token = authorization.split(' ')[1];
        if (!token) {
            throw new Error('Invalid token');
        }
        return token;
    }

    protected abstract verifyToken(token: string): UserToken;
}
