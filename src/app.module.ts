import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllersModule } from './controllers/controllers.module';
import { AuthModule } from './infra/auth/auth.module';
import { DatabaseModule } from './infra/database/database.module';
import { EnvironmentModule } from './infra/environment/environment.module';
import { Environment } from './infra/environment/environment.service';

@Module({
  imports: [EnvironmentModule, DatabaseModule, AuthModule, ControllersModule],
  controllers: [AppController],
  providers: [AppService, Environment],
  exports: [Environment],
})
export class AppModule {}
