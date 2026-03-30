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
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';

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
    return this.cvsService.statCvNumberByAge(
      query.min,
      query.max,
    );
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

}