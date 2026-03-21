import { Global, Module } from '@nestjs/common';
import { mappersProvider } from './mappers.provider';
import { databaseProviders } from './database.provider';
import { modelsProvider } from './models.provider';

@Global()
@Module({
  providers: [...databaseProviders, ...modelsProvider, ...mappersProvider],
  exports: [...databaseProviders, ...modelsProvider, ...mappersProvider],
})
export class DatabaseModule {}
