import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeStampEntity } from '../../common/db/timestamp.entity';
import { CvEntity } from '../../cvs/entities/cv.entity';
import { RoleEntity } from '../../roles/entities/role.entity';

@Entity('user')
export class UserEntity extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
    unique: true,
  })
  username: string;
  @Column({
    length: 50,
    unique: true,
  })
  email: string;
  @Column({
    select: false,
  })
  password: string;
  @OneToMany(() => CvEntity, (cv) => cv.user, {
    cascade: true,
    eager: false,
  })
  cvs: CvEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.users, {
    cascade: true,
  })
  @JoinTable()
  roles: RoleEntity[];
}
