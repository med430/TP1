import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEnum } from '../enums/user-role.enum';

export class UserCriteriaDto extends PartialType(OmitType(UserEntity, ['roles'])) {}