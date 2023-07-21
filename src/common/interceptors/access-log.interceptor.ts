import { InjectQueue } from '@nestjs/bull';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
    constructor(@InjectQueue('access-log') private readonly accessLogQueue: Queue) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.userId || request?.userId;
        if (!userId) {
            return next.handle();
        }

        if (request.url === `/api/ping`) {
            this.accessLogQueue.add('check-time-spent', {
                userId,
            });
        } else {
            this.accessLogQueue.add('calc-time-spent', {
                userId,
            });
        }

        return next.handle();
    }
}
