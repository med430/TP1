import { Module } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEntity } from './entities/cv.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CvsController],
  providers: [CvsService],
  imports: [TypeOrmModule.forFeature([CvEntity]), AuthModule],
})
export class CvsModule {}