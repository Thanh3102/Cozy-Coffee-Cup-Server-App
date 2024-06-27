import { PrismaService } from 'src/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/utils/enum';
import { CustomRequest } from 'src/utils/interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();
    return this.checkPermission(requiredPermission, request);
  }

  async checkPermission(requiredPermission: Permission, req: CustomRequest) {
    if (!requiredPermission) {
      return true;
    }

    const userPerms = await this.getUserPermissions(req.user.id);

    if (userPerms.includes(requiredPermission)) {
      return true;
    } else {
      console.log(requiredPermission);
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện hành động này. (Require permission: ${requiredPermission})`,
      );
    }
  }

  async getUserPermissions(user_id: string) {
    try {
      const accountRole = await this.prisma.userRole.findMany({
        select: {
          role: {
            select: {
              id: true,
            },
          },
        },
        where: {
          user_id: user_id,
        },
      });

      const perms = new Set<string>();

      for (let role of accountRole) {
        const rolePerms = await this.prisma.rolePermission.findMany({
          where: {
            role_id: role.role.id,
          },
          select: {
            permission: {
              select: {
                name: true,
              },
            },
          },
        });

        rolePerms.forEach((p) => {
          perms.add(p.permission.name);
        });
      }
      return Array.from(perms);
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
