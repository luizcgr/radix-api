import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from '../database/database.module';
import { EnvironmentModule } from '../environment/environment.module';
import { Environment } from '../environment/environment.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GeradorJwtTokenService } from './services/gerador-jwt-token.service';
import { LoginEmailSenhaService } from './services/login-email-senha.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserInfo } from './user-info/user-info';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    GeradorJwtTokenService,
    LoginEmailSenhaService,
    RefreshTokenService,
  ],
  exports: [LoginEmailSenhaService, UserInfo, RefreshTokenService],
})
export class AuthModule {}
