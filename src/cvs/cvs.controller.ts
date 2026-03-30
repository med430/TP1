import { Controller } from '@nestjs/common';
import { CvsService } from './cvs.service';

@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}
}
