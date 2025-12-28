import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Environment } from './environment.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [Environment],
  exports: [Environment],
})
export class EnvironmentModule {}
