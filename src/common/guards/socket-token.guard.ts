import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { ConfigKey } from '../config';
import { UserToken } from '../interfaces';

@Injectable()
export class SocketToken implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = this.getClient(context);
    try {
      const token = this.getToken(client);
      const user = this.verifyToken(token);
      client.user = user;
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

  private getToken(client: Socket): string {
    const { token } = client.handshake.headers;

    if (!token || Array.isArray(token)) {
      throw new WsException('Invalid token');
    }
    return token;
  }

  private verifyToken(token: string): UserToken {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_SECRET),
    });
  }
}
