import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { defer, Observable } from 'rxjs';
import { EVENTO_DEVOLUCAO_REALIZADA } from 'src/constants';
import { EmailService } from 'src/infra/email/email.service';
import type { EventoDevolucaoRealizada } from '../events/devolucao-realizada.event';

@Controller()
export class EmailPagamentoController {
  private readonly _logger = new Logger(EmailPagamentoController.name);

  constructor(private readonly _emailService: EmailService) {}

  @EventPattern(EVENTO_DEVOLUCAO_REALIZADA)
  handleDevolucaoRealizada(evento: EventoDevolucaoRealizada) {
    this._logger.debug(
      `Recebido evento de devolução realizada: ${JSON.stringify(evento)}`,
    );
    this._enviarEmailConfirmacao(evento).subscribe({
      next: () =>
        this._logger.debug(
          `Email de confirmação enviado com sucesso para ${evento.email}.`,
        ),
      error: (err) =>
        this._logger.error(
          `Erro ao enviar email de confirmação para ${evento.email}`,
          err,
        ),
    });
  }

  private _enviarEmailConfirmacao(
    evento: EventoDevolucaoRealizada,
  ): Observable<any> {
    return defer(() => {
      const email = evento.email;
      return this._emailService.enviar({
        assunto: 'Pagamento recebido',
        texto: this._montarMensagem(evento),
        endereco: email,
      });
    });
  }

  private _montarMensagem(evento: EventoDevolucaoRealizada): string {
    return `Recebemos o valor da sua contribuição. Que Deus retribua a sua generosidade.<p>Atenciosamente,<br>Economato ${evento.setor}</p>`;
  }
}
