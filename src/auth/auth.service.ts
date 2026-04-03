import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { CredenialsDto } from './dto/credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponeDto } from './dto/login-response.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(dto: CreateUserDto): Promise<Partial<UserEntity>> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userRole = await this.userRepository.manager.findOne('RoleEntity', {
      where: { name: 'USER' },
    });

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      roles: [userRole],
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
  async login(credentialsDto: CredenialsDto): Promise<LoginResponeDto> {
    const { identifier, password } = credentialsDto;

    const user = await this.userService.getUserByIdentifier(
      identifier,
      true,
      true,
    );
    if (!user) {
      throw new UnauthorizedException('Veuillez vérifier vos credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Veuillez vérifier vos credentials');
    }

    const payload: JwtPayloadDto = {
      username: user.username,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };
    const jwt = this.jwtService.sign(payload);

    return {
      jwt,
    };
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user.roles?.some((r) => r.name === 'ADMIN');
  }

  async canAccessResource(
    user: UserEntity,
    resourceOwnerId: number,
  ): Promise<void> {
      const fullUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['roles'],
      });

      if (!fullUser) {
      throw new ForbiddenException('User not found');
    }

    const isAdmin = fullUser.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin) {
      return; // ✅ Admin can access everything
    }

    if (fullUser.id !== resourceOwnerId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
