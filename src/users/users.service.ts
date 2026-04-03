import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEntity } from '../roles/entities/role.entity';

@Injectable()
export class UsersService extends GenericCrud<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {
    super(userRepository);
  }

  public async validateUniqueFields(
    fields: { email?: string; username?: string },
    excludeId?: number,
  ): Promise<void> {
    const checks: (keyof UserEntity)[] = ['email', 'username'];

    for (const field of checks) {
      if (fields[field]) {
        const exists = await this.repository.findOne({
          where: { [field]: fields[field] },
        });

        if (exists && exists.id !== excludeId) {
          throw new BadRequestException(`${field} already exists`);
        }
      }
    }
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    await this.validateUniqueFields(dto, id);
    return super.update(id, dto);
  }

  async updateByCriteria(
    criteria: FindOptionsWhere<UserEntity>,
    dto: UpdateUserDto,
  ): Promise<UpdateResult> {
    await this.validateUniqueFields(dto as Partial<UserEntity>);
    return super.updateByCriteria(criteria, dto);
  }

  async getUserByIdentifier(
    identifier: string,
    withPassword = false,
    withRoles = false,
  ) {
    const qb = this.repository
      .createQueryBuilder('user')
      .where('user.username = :identifier', { identifier })
      .orWhere('user.email = :identifier', { identifier });

    if (withPassword) {
      qb.addSelect(['user.password']);
    }

    if (withRoles) {
      qb.leftJoinAndSelect('user.roles', 'roles'); // 🔥 THIS FIXES EVERYTHING
    }

    return qb.getOne();
  }

  async findUserRoles(userId: number): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
  }

  async addRole(userId: number, roleId: number) {
    const user = await this.findUserRoles(userId);
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (user && role) {
      user.roles.push(role);
      return this.repository.save(user);
    }
    return null;
  }
}
