import { Module } from '@nestjs/common';
import { AuthModule } from 'src/infra/auth/auth.module';
import { PessoasModule } from 'src/modules/pessoas/pessoas.module';
import { LoginEmailSenhaController } from './login/login-email-senha.controller';
import { PessoasController } from './pessoas/pessoas.controller';

@Module({
  imports: [AuthModule, PessoasModule],
  controllers: [LoginEmailSenhaController, PessoasController],
})
export class ControllersModule {}
