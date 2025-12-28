import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { Environment } from '../environment/environment.service';
import { AuthGuard } from './guards/auth.guard';
import { LoginEmailSenhaService } from './services/login-email-senha.service';
import { GeradorJwtTokenService } from './services/gerador-jwt-token.service';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    GeradorJwtTokenService,
    LoginEmailSenhaService,
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [Environment],
      global: true,
      useFactory: ({ jwt }: Environment) => ({
        secret: jwt.secret,
        signOptions: { expiresIn: jwt.expiresIn as StringValue },
      }),
    }),
  ],
  exports: [LoginEmailSenhaService],
})
export class AuthModule {}
