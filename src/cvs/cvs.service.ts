import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { CvEntity } from './entities/cv.entity';
import { UpdateCvDto } from './dto/update-cv.dto';

@Injectable()
export class CvsService extends GenericCrud<CvEntity> {
  constructor(
    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>,
  ) {
    super(cvRepository);
  }
}