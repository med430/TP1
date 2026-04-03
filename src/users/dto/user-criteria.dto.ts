import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserEntity } from '../entities/user.entity';

export class UserCriteriaDto extends PartialType(OmitType(UserEntity, ['roles'])) {}