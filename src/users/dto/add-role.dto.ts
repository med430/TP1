import { Min } from 'class-validator';

export class AddRoleDto {
  @Min(0)
  roleId: number;
}