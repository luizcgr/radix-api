import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { DatabaseModule } from '../database/database.module';
import { Environment } from '../environment/environment.service';
import { EnvironmentModule } from '../environment/environment.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GeradorJwtTokenService } from './services/gerador-jwt-token.service';
import { LoginEmailSenhaService } from './services/login-email-senha.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserInfo } from './user-info/user-info';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      inject: [Environment],
      global: true,
      useFactory: ({ jwt }: Environment) => ({
        secret: jwt.secret,
        signOptions: { expiresIn: jwt.expiresIn as StringValue },
      }),
    }),
  ],
  providers: [
    UserInfo,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    GeradorJwtTokenService,
    LoginEmailSenhaService,
  ],
  exports: [LoginEmailSenhaService, UserInfo],
})
export class AuthModule {}
