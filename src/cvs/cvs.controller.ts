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


@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }

  @Get()
  findAll() {
    return this.cvsService.findAll();
  }

}