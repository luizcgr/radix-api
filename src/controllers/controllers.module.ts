import { Module } from '@nestjs/common';
import { AuthModule } from 'src/infra/auth/auth.module';
import { LoginEmailSenhaController } from './login/login-email-senha.controller';
import { PessoasController } from './pessoas/pessoas.controller';

@Module({
  imports: [AuthModule],
  controllers: [LoginEmailSenhaController, PessoasController],
})
export class ControllersModule {}
