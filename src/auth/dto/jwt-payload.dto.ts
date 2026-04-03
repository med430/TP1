import { RoleEntity } from '../../roles/entities/role.entity';

export interface JwtPayloadDto {
  username: string;
  roles: string[];
  email: string;
}
