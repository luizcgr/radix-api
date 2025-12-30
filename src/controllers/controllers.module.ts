import { Module } from '@nestjs/common';
import { AuthModule } from 'src/infra/auth/auth.module';
import { DevolucaoModule } from 'src/modules/devolucao/devolucao.module';
import { PessoasModule } from 'src/modules/pessoas/pessoas.module';
import { DevolucaoController } from './devolucao/devolucao.controller';
import { LoginEmailSenhaController } from './login/login-email-senha.controller';
import { PessoasController } from './pessoas/pessoas.controller';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [AuthModule, PessoasModule, DevolucaoModule],
  controllers: [
    LoginEmailSenhaController,
    PessoasController,
    DevolucaoController,
    WebhookController,
  ],
})
export class ControllersModule {}
