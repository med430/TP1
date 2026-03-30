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
} from '@nestjs/common';

import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';


@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }

  @Get()
  findAll() {
    return this.cvsService.findAll();
  }

   @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,

  ) {
    return this.cvsService.findOne(id);
  }

  
  @Post()
  create(
    @Body() dto: CreateCvDto,
  ) {
    return this.cvsService.createCv(dto);
  }


  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,

  ): Promise<CvEntity> {
      return this.cvsService.updateCv(id, dto);
  }

   @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
   return this.cvsService.softDelete(id);

  }

    @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.restore(id);
  }

}