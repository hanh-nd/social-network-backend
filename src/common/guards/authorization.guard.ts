import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { intersection } from 'lodash';
import { PermissionName } from '../constants';

export const Permissions = (permissions: PermissionName[]) => SetMetadata('permissions', permissions);

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const loginUser = context.switchToHttp().getRequest().user;
        const routeRequiredPermissions = this.reflector.get<PermissionName[]>('permissions', context.getHandler());

        // this route doesn't need any permission
        if (!routeRequiredPermissions || routeRequiredPermissions?.length === 0) {
            return true;
        }

        const isPermitted = intersection(loginUser?.permissions, routeRequiredPermissions).length > 0;
        if (!isPermitted) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }
        return true;
    }
}
