import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import DbProvider from './db-provider';
import { DbTxType } from './db.types';

@Injectable()
export default class TransactionManager {
  constructor(private readonly db: DbProvider) {}

  async tx<T>(
    isolationLevel: Prisma.TransactionIsolationLevel,
    callback: (tx: DbTxType) => Promise<T>,
  ) {
    return this.db.$transaction(
      callback,
      isolationLevel ? { isolationLevel } : undefined,
    );
  }
}
