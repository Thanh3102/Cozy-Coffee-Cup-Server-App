import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomRequest } from 'src/utils/interface';
import {
  CreateAccountDto,
  CreateRoleDto,
  UpdateAccountDto,
  UpdateRoleDto,
} from 'src/utils/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getAll(res: Response) {
    try {
      const accounts = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          user_role: {
            select: {
              role: true,
            },
          },
        },
        where: {
          void: false,
        },
      });
      const reponseData = accounts.map((account) => {
        const roles = account.user_role.map((role) => {
          return {
            id: role.role.id,
            name: role.role.name,
            color: role.role.color,
          };
        });

        const sortedRoles = roles.sort((a, b) => a.name.localeCompare(b.name));

        return {
          id: account.id,
          name: account.name,
          username: account.username,
          roles: sortedRoles,
        };
      });
      return res.status(200).json({ accounts: reponseData });
    } catch (error: any) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async getAllWithPaginition(page: number, itemPerPage: number, res: Response) {
    try {
      const skipRecord = page === 1 ? 0 : itemPerPage * (page - 1);
      const accounts = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          user_role: {
            select: {
              role: true,
            },
          },
        },
        skip: skipRecord,
        take: itemPerPage,
      });
      const reponseData = accounts.map((account) => {
        const roles = account.user_role.map((role) => {
          return role.role.name;
        });
        return {
          id: account.id,
          name: account.name,
          username: account.username,
          roles: roles,
        };
      });
      return res.status(200).json({ accounts: reponseData });
    } catch (error: any) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async getAllPermission(res: Response) {
    try {
      const perms = await this.prisma.permission.findMany();
      return res.status(200).json({ permissions: perms });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async getRolePermission(role_id: string, res: Response) {
    try {
      const perms = await this.prisma.rolePermission.findMany({
        select: {
          permission_id: true,
        },
        where: {
          role_id: role_id,
        },
      });
      return res.status(200).json({ perms: perms.map((p) => p.permission_id) });
    } catch (error) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async getAllRoles(res: Response) {
    try {
      const roles = await this.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          created_at: true,
          user: {
            select: {
              name: true,
              username: true,
            },
          },
          _count: {
            select: {
              user_role: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      return res.status(200).json({ roles: roles });
    } catch (error) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async getAccountPermissions(account_id: string, res: Response) {
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
          user_id: account_id,
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
      return res.status(200).json({ permissions: Array.from(perms) });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async getAccountDetail(account_id: string, res: Response) {
    try {
      const account = await this.prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          username: true,
          user_role: {
            select: {
              role: true,
            },
          },
        },
        where: {
          id: account_id,
        },
      });

      const roles = account.user_role.map((role) => {
        return {
          id: role.role.id,
          name: role.role.name,
          color: role.role.color,
        };
      });

      const sortedRoles = roles.sort((a, b) => a.name.localeCompare(b.name));

      const reponseData = {
        id: account.id,
        name: account.name,
        username: account.username,
        roles: sortedRoles,
      };

      return res.status(200).json({ account: reponseData });
    } catch (error: any) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async createRole(dto: CreateRoleDto, req: CustomRequest, res: Response) {
    try {
      const existsRoleName = await this.prisma.role.findFirst({
        where: {
          name: dto.name,
        },
      });
      if (existsRoleName) {
        return res.status(500).json({ message: 'Tên vai trò đã tồn tại' });
      }
      await this.prisma.$transaction(async (tx) => {
        const role = await tx.role.create({
          data: {
            color: dto.color,
            name: dto.name,
            created_by: req.user.id,
            updated_by: req.user.id,
          },
        });

        if (dto.perms.length !== 0) {
          for (let perm of dto.perms) {
            await tx.rolePermission.create({
              data: {
                role_id: role.id,
                permission_id: perm,
              },
            });
          }
        }
      });
      return res.status(200).json({ message: 'Thêm mới thành công' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async updateRole(dto: UpdateRoleDto, req: CustomRequest, res: Response) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
          where: {
            role_id: dto.id,
          },
        });

        await tx.role.update({
          where: {
            id: dto.id,
          },
          data: {
            name: dto.name,
            color: dto.color,
            updated_by: req.user.id,
          },
        });

        for (let perm of dto.perms) {
          await tx.rolePermission.create({
            data: {
              permission_id: perm,
              role_id: dto.id,
            },
          });
        }
      });
      return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async deleteRole(id: string, res: Response) {
    try {
      this.prisma.$transaction(async (tx) => {
        await tx.userRole.deleteMany({
          where: {
            role_id: id,
          },
        });

        await tx.rolePermission.deleteMany({
          where: {
            role_id: id,
          },
        });

        await tx.role.delete({
          where: {
            id: id,
          },
        });
      });
      return res.status(200).json({ message: 'Xóa thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async createAccount(dto: CreateAccountDto, res: Response) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const isUsernameExists = await this.prisma.user.findFirst({
          where: {
            username: dto.username,
            void: false,
          },
        });

        if (isUsernameExists) {
          return res.status(500).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        const account = await tx.user.create({
          data: {
            name: dto.name,
            username: dto.username,
            password: await bcrypt.hash(dto.password, 10),
          },
        });

        for (let role of dto.roles) {
          await tx.userRole.create({
            data: {
              role_id: role,
              user_id: account.id,
            },
          });
        }
      });
      return res.status(200).json({ message: 'Tạo tài khoản thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async updateAccount(dto: UpdateAccountDto, res: Response) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const account = await tx.user.update({
          where: {
            id: dto.id,
          },
          data: {
            name: dto.name,
          },
        });

        const accountRoles = await tx.userRole.findMany({
          where: {
            user_id: account.id,
          },
          select: {
            id: true,
            role_id: true,
          },
        });

        // Add new role
        for (let dtoRoleId of dto.roles) {
          if (accountRoles.some((role) => role.role_id === dtoRoleId)) continue;
          else {
            await tx.userRole.create({
              data: {
                user_id: account.id,
                role_id: dtoRoleId,
              },
            });
          }
        }

        // Delete role
        for (let role of accountRoles) {
          if (dto.roles.some((r) => r === role.role_id)) continue;
          else {
            await tx.userRole.delete({
              where: {
                id: role.id,
              },
            });
          }
        }
      });
      return res.status(200).json({ message: 'Lưu thành công' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
  }

  async deleteAccount(account_id: string, res: Response) {
    try {
      await this.prisma.user.update({
        data: {
          void: true,
        },
        where: {
          id: account_id,
        },
      });
      return res.status(200).json({ message: 'Đã xóa tài khoản' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }

  async resetPassword(account_id: string, res: Response) {
    try {
      await this.prisma.user.update({
        data: {
          password: await bcrypt.hash('123456', 10),
        },
        where: {
          id: account_id,
        },
      });
      return res
        .status(200)
        .json({ message: 'Đã đặt lại mật khẩu về mặc định' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: error.message ?? 'Đã xảy ra lỗi' });
    }
  }
}
