import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class SocketToken implements CanActivate {
    constructor(private jwtService: JwtService, private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client = this.getClient(context);
        try {
            const { userId } = client;
            if (!userId) return false;
            return true;
        } catch (e) {
            // return false or throw a specific error if desired
            console.log('got socket token guard error', e);
            return false;
        }
    }

    private getClient(context: ExecutionContext) {
        return context.switchToWs().getClient();
    }
}
