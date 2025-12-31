import {
  Body,
  Controller,
  Headers,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from 'src/infra/auth/decorators/public.decorator';
import { Environment } from 'src/infra/environment/environment.service';
import type { AsaasWebhookPayload } from 'src/modules/cobranca/interfaces/asaas-webhook-payload';
import { AsaasWebhookPaymentPayload } from 'src/modules/cobranca/interfaces/asaas-webhook-payment-payload';
import { NotificacaoPagamentoService } from 'src/modules/devolucao/services/notificacao-pagamento.service';
import { CustomError } from 'src/utils/custom-error';

@Controller('v1/webhooks')
export class WebhookController {
  constructor(
    private readonly _notificacaoPagamentoService: NotificacaoPagamentoService,
    private readonly _environment: Environment,
  ) {}

  @Public()
  @Post('asaas')
  processarNotificacaoPagamentoAsaas(
    @Body() payload: any,
    @Headers('asaas-access-token') asaasAccessToken: string,
    @Res() res: Response,
  ) {
    this._validarWebhookAccessToken(asaasAccessToken);
    const webhook = payload as AsaasWebhookPayload;
    if (webhook.event === 'PAYMENT_RECEIVED') {
      const payment = payload as AsaasWebhookPaymentPayload;
      this._receberPagamentoAsaas(payment, res);
    } else {
      res.status(204).send();
    }
  }

  private _receberPagamentoAsaas(
    payment: AsaasWebhookPaymentPayload,
    res: Response<any, Record<string, any>>,
  ) {
    this._notificacaoPagamentoService.receber(payment.payment.id).subscribe({
      next: () => res.status(204).send(),
      error: (err: CustomError) =>
        res.status(err.code).json({ status: 'error', message: err.message }),
    });
  }

  private _validarWebhookAccessToken(asaasAccessToken: string) {
    if (asaasAccessToken !== this._environment.asaas.webhookAccessToken) {
      throw new UnauthorizedException();
    }
  }
}
