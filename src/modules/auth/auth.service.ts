import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { ConfigKey } from 'src/common/config';
import { CommonMessage, RoleName } from 'src/common/constants';
import { ItemAlreadyExistedException } from 'src/common/exception/item-already-existed.exception';
import { IDataServices } from 'src/common/repositories/data.service';
import { User } from 'src/mongo-schemas';
import { compare, hash } from 'src/plugins/bcrypt';
import { IJwtPayload, ILoginBody, IRegisterBody } from './auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private dataServices: IDataServices,
    ) {}

    async login(body: ILoginBody) {
        const existedUser = await this.dataServices.users.findOne({
            username: body.username,
        });
        if (!existedUser) {
            throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác.');
        }

        const isCorrectPassword = compare(body.password, existedUser.password);

        if (!isCorrectPassword) {
            throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác.');
        }

        const token = await this.signUserToken(existedUser);
        return token;
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
            throw new Error(CommonMessage.AN_ERROR_OCCURRED);
        }
        const createdUser = await this.dataServices.users.create({
            ...body,
            password: hashedPassword,
            roleId: new ObjectId(userRole._id),
        });

        const token = await this.signUserToken(createdUser);
        return token;
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
        return accessToken;
    }
}
