import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GenericCrud } from '../common/db/generic-crud.service';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService extends GenericCrud<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super(roleRepository);
  }

  create(createRoleDto: CreateRoleDto) {
    return this.repository.save(createRoleDto);
  }

  findAll() {
    return this.repository.find();
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
