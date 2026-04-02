import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Delete,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';

import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
} from '../common/files/file-upload.utils';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../users/enums/user-role.enum';

@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }

  @Get()
  findAll() {
    return this.cvsService.findAll();
  }

  @Get('stats')
  statsCvNumberByAge(@Query() query: StatParamDto) {
    return this.cvsService.statCvNumberByAge(query.min, query.max);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.findOne(id);
  }

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
    @CurrentUser() user: UserEntity
  ): Promise<CvEntity> {
    const cv = await this.cvsService.findOneWithUser(id);

    if (user.role === UserRoleEnum.ADMIN || cv.user.id === user.id) {
      if (file) {
        dto.path = file.filename;
      }

      return this.cvsService.updateCv(id, dto);
    }

    throw new ForbiddenException('You can only modify your own cvs');
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ) {
    const cv = await this.cvsService.findOneWithUser(id);
    if (user.role === UserRoleEnum.ADMIN || cv.user.id === user.id) {
      return this.cvsService.softDelete(id);
    }
    throw new ForbiddenException('You can only delete your own cvs');
  }

  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
    @CurrentUser() user: UserEntity
  ) {
    return this.cvsService.updateByCriteriaCv(body.criteria, body.dto, user);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.restore(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.delete(id);
  }
}
