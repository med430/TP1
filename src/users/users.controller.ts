import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController extends GenericController<UserEntity> {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService) {
    super(usersService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
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
    this.authService.canAccessResource(user, id);

    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Version('1')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: UserEntity,
  ) {
    this.authService.canAccessResource(user, id);

    return this.usersService.updateUser(id, dto);
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
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    this.authService.canAccessResource(user, id);

    return this.usersService.softDelete(id);
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
}
