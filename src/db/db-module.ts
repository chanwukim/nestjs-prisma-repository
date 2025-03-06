import { Global, Module } from '@nestjs/common';

import DbProvider from './db-provider';
import TransactionManager from './transaction-manager';

@Global()
@Module({
  providers: [DbProvider, TransactionManager],
  exports: [DbProvider, TransactionManager],
})
export default class DbModule {}
