import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule as NestWinstonModule } from 'nest-winston';

import { Module } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigKey } from '../../config';
const { label, combine, timestamp, printf } = winston.format;

export function createWinstonLogger(moduleName: string, configService: ConfigService) {
    const format = printf(({ level, message, timestamp, service }) => {
        return `[${timestamp}] ${level.toUpperCase()} (${service}): ${message}`;
    });
    return winston.createLogger({
        level: configService.get(ConfigKey.LOG_LEVEL),
        format: combine(label({ label: moduleName, message: true }), timestamp(), format),
        defaultMeta: { service: 'social-network' },
        transports: [
            new winston.transports.Console({
                level: configService.get(ConfigKey.LOG_LEVEL),
            }),
            new winston.transports.DailyRotateFile({
                filename: `${configService.get(ConfigKey.LOG_ROOT_FOLDER)}/%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });
}

@Module({
    imports: [
        NestWinstonModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return winston.createLogger({
                    level: configService.get(ConfigKey.LOG_LEVEL),
                    format: winston.format.json(),
                    defaultMeta: { service: 'social-network' },
                    transports: [
                        new winston.transports.Console({
                            level: configService.get(ConfigKey.LOG_LEVEL),
                        }),
                        new winston.transports.DailyRotateFile({
                            filename: `${configService.get(ConfigKey.LOG_ROOT_FOLDER)}/social-network-%DATE%.log`,
                            datePattern: 'YYYY-MM-DD',
                            zippedArchive: true,
                            maxSize: '20m',
                            maxFiles: '14d',
                        }),
                    ],
                });
            },
        }),
    ],
    providers: [],
})
export class WinstonModule {}
