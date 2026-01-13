import { Module } from '@nestjs/common';
import { AuthModule } from 'src/infra/auth/auth.module';
import { CelulasModule } from 'src/modules/celulas/celulas.module';
import { DevolucaoModule } from 'src/modules/devolucao/devolucao.module';
import { PessoasModule } from 'src/modules/pessoas/pessoas.module';
import { DevolucaoController } from './devolucao/devolucao.controller';
import { LoginEmailSenhaController } from './login/login-email-senha.controller';
import { MeuSetorController } from './meu-setor/meu-setor.controller';
import { MinhaCelulaController } from './minha-celula/minha-celula.controller';
import { MinhaMissaoController } from './minha-missao/minha-missao.controller';
import { RefreshTokenController } from './refresh-token/refresh-token.controller';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [AuthModule, PessoasModule, DevolucaoModule, CelulasModule],
  controllers: [
    LoginEmailSenhaController,
    DevolucaoController,
    WebhookController,
    RefreshTokenController,
    MinhaCelulaController,
    MeuSetorController,
    MinhaMissaoController,
  ],
})
export class ControllersModule {}
