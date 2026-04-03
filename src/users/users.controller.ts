import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UpdateByCriteriaUserDto } from './dto/update-by-criteria-user.dto';
import { Roles } from '../decorators/role.decorator';
import { RoleEntity } from '../roles/entities/role.entity';
import { AddRoleDto } from './dto/add-role.dto';

@Controller('users')
export class UsersController extends GenericController<UserEntity> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin || user.id === id) {
      return this.usersService.findOne(id);
    }

    throw new ForbiddenException('You can only access your account');
  }

  @UseGuards(JwtAuthGuard)
  @Version('1')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: UserEntity,
  ) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin || user.id === id) {
      return this.usersService.updateUser(id, dto);
    }

    throw new ForbiddenException('You can only update your own account');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.updateByCriteria(body.criteria, body.dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin || user.id === id) {
      return this.usersService.softDelete(id);
    }

    throw new ForbiddenException('You can only delete your own account');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async userRoles(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserRoles(+id);
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id')
  async addRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() addRoleDto: AddRoleDto,
  ) {
    return this.usersService.addRole(userId, addRoleDto.roleId);
  }
}
