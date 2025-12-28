import { Global, Module } from '@nestjs/common';
import { adaptersProvider } from './adapters.provider';
import { databaseProviders } from './database.provider';
import { modelsProvider } from './models.provider';

@Global()
@Module({
  providers: [...databaseProviders, ...modelsProvider, ...adaptersProvider],
  exports: [...databaseProviders, ...modelsProvider, ...adaptersProvider],
})
export class DatabaseModule {}
