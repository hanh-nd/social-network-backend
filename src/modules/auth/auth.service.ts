import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { ConfigKey } from 'src/common/config';
import { ElasticsearchIndex, RoleName } from 'src/common/constants';
import { DefaultInternalServerErrorException } from 'src/common/exception/default-internal-system-error.exception';
import { ItemAlreadyExistedException } from 'src/common/exception/item-already-existed.exception';
import { generateRandomString } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { User } from 'src/mongo-schemas';
import { compare, hash } from 'src/plugins/bcrypt';
import {
    IForgotPasswordBody,
    IGetNewPasswordFromUserToken,
    IJwtPayload,
    ILoginBody,
    IRegisterBody,
} from './auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
    ) {}

    async login(body: ILoginBody) {
        const existedUser = await this.dataServices.users.findOne({
            username: body.username,
        });
        if (!existedUser) {
            throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác.');
        }

        const isCorrectPassword = await compare(body.password, existedUser.password);

        if (!isCorrectPassword) {
            throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác.');
        }

        const token = await this.signUserToken(existedUser);
        const updatedUser = await this.dataServices.users.updateById(existedUser._id, {
            lastOnlineAt: moment().toISOString(),
            lastRefreshToken: token.refreshToken,
        });

        const userDto = await this.dataResources.users.mapToDto(updatedUser);

        return {
            user: userDto,
            ...token,
        };
    }

    async register(body: IRegisterBody) {
        const existedUser = await this.dataServices.users.findOne({
            username: body.username,
        });
        if (existedUser) {
            throw new ItemAlreadyExistedException('Tên tài khoản đã tồn tại.');
        }

        const hashedPassword = await hash(body.password);
        const userRole = await this.dataServices.roles.findOne({
            name: RoleName.USER,
        });
        if (!userRole) {
            throw new DefaultInternalServerErrorException();
        }
        const createdUser = await this.dataServices.users.create({
            ...body,
            password: hashedPassword,
            roleId: new ObjectId(userRole._id),
        });
        this.elasticsearchService.index<User>(ElasticsearchIndex.USER, {
            _id: createdUser._id,
            username: createdUser.username,
            fullName: createdUser.fullName,
        });
        const token = await this.signUserToken(createdUser);
        const updatedUser = await this.dataServices.users.updateById(createdUser._id, {
            lastRefreshToken: token.refreshToken,
        });

        const userDto = await this.dataResources.users.mapToDto(updatedUser);

        return {
            user: userDto,
            ...token,
        };
    }

    async forgotPassword(body: IForgotPasswordBody) {
        const existedUser = await this.dataServices.users.findOne({
            email: body.email,
        });

        if (!existedUser) {
            throw new NotFoundException(`Không tìm thấy người dùng với địa chỉ email này.`);
        }

        const generatedUserToken = generateRandomString(32);
        await this.dataServices.userTokens.bulkDelete({
            userId: new ObjectId(existedUser._id),
            expiredIn: {
                $gt: moment().toISOString(),
            },
        });
        await this.dataServices.userTokens.create({
            userId: new ObjectId(existedUser._id),
            token: generatedUserToken,
            expiredIn: moment().add(1, 'days').toISOString(),
        });

        return true;
    }

    async getNewPasswordFromUserToken(body: IGetNewPasswordFromUserToken) {
        const existedUserToken = await this.dataServices.userTokens.findOne({
            token: body.token,
            expiredIn: {
                $gt: moment().toISOString(),
            },
        });

        if (!existedUserToken) {
            throw new BadRequestException(`Mã không hợp lệ.`);
        }

        const hashedPassword = await hash(body.password);
        await this.dataServices.userTokens.deleteById(existedUserToken._id);
        const updatedUser = await this.dataServices.users.updateById(existedUserToken.userId, {
            lastOnlineAt: moment().toISOString(),
            password: hashedPassword,
        });

        const token = await this.signUserToken(updatedUser);
        const userDto = await this.dataResources.users.mapToDto(updatedUser);
        return {
            user: userDto,
            ...token,
        };
    }

    async refreshToken(userId: string, refreshToken: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new BadRequestException(`Token không hợp lệ.`);
        }

        if (existedUser.lastRefreshToken !== refreshToken) {
            throw new BadRequestException(`Token không hợp lệ.`);
        }

        const token = await this.signUserToken(existedUser);
        const updatedUser = await this.dataServices.users.updateById(existedUser._id, {
            lastOnlineAt: moment().toISOString(),
            lastRefreshToken: token.refreshToken,
        });

        const userDto = await this.dataResources.users.mapToDto(updatedUser);
        return {
            user: userDto,
            ...token,
        };
    }

    async logout(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new BadRequestException(`Token không hợp lệ.`);
        }

        await this.dataServices.users.updateById(existedUser._id, {
            lastOnlineAt: moment().toISOString(),
            lastRefreshToken: null,
        });

        return true;
    }

    async signUserToken(user: User) {
        const { roleId } = user;
        const role = await this.dataServices.roles.findById(roleId);
        if (!role) {
            throw new ForbiddenException('Bạn không có quyền để thực hiện tác vụ này.');
        }

        const { permissions = [] } = role;

        const token = await this.createToken({
            userId: user._id,
            username: user.username,
            role: role.name,
            permissions,
        });
        return token;
    }

    async createToken(payload: IJwtPayload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_SECRET),
            expiresIn: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_EXPIRES_TIME),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_TOKEN_SECRET),
            expiresIn: this.configService.get<string>(ConfigKey.JWT_REFRESH_TOKEN_EXPIRES_TIME),
        });
        return {
            accessToken,
            refreshToken,
        };
    }
}
