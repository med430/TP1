import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/role.decorator';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  editFileName,
  imageFileFilter,
} from '../common/files/file-upload.utils';
import { diskStorage } from 'multer';
import { AuthService } from '../auth/auth.service';

@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(
    private readonly cvsService: CvsService,
    private readonly authService: AuthService,
  ) {
    super(cvsService);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: UserEntity) {
    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');

    if (isAdmin) {
      return this.cvsService.findAll();
    }

    return this.cvsService.findMyCvs(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  statsCvNumberByAge(@Query() query: StatParamDto) {
    return this.cvsService.statCvNumberByAge(query.min, query.max);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    this.authService.canAccessResource(user, cv.user.id);

    return cv;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @Body() dto: CreateCvDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ) {
    if (file) {
      dto.path = file.filename;
    }

    return this.cvsService.createCv(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ): Promise<CvEntity> {
    const cv = await this.cvsService.findOneWithUser(id);

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    this.authService.canAccessResource(user, cv.user.id);

    if (file) {
      dto.path = file.filename;
    }

    return this.cvsService.updateCv(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    this.authService.canAccessResource(user, cv.user.id);

    return this.cvsService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.cvsService.updateByCriteriaCv(body.criteria, body.dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.delete(id);
  }
}
