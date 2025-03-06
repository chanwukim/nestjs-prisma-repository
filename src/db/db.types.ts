import DbProvider from './db-provider';

export type DbTxType = Parameters<Parameters<DbProvider['$transaction']>[0]>[0];
