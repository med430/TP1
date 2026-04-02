import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserCriteriaDto } from './user-criteria.dto';

export class UpdateByCriteriaUserDto {
  @IsObject()
  criteria: UserCriteriaDto;
  @ValidateNested()
  @Type(() => UpdateUserDto)
  dto: UpdateUserDto;
}
