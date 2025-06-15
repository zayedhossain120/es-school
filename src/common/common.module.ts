// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { QueryEngine } from './services/query.service';

@Module({
  providers: [QueryEngine],
  exports: [QueryEngine],
})
export class CommonModule {}
