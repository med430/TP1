import {
  ForbiddenException,
  Inject,
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
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject()
    private userRepository: Repository<UserEntity>,
  ) {}

  async register(dto: CreateUserDto): Promise<Partial<UserEntity>> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      roles: ['USER'],
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
  async login(credentialsDto: CredenialsDto): Promise<LoginResponeDto> {
    const { identifier, password } = credentialsDto;

    const user = await this.userService.getUserByIdentifier(identifier, true);
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
      roles: user.roles,
    };
    const jwt = this.jwtService.sign(payload);

    return {
      jwt,
    };
  }
  canAccessResource(user: UserEntity, ownerId: number): void {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin || user.id === ownerId) {
      return;
    }

    throw new ForbiddenException('Access denied');
  }
}
