import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EVENTO_ENVIO_LINK_PAGAMENTO } from 'src/constants';
import { EmailService } from 'src/infra/email/email.service';
import type { EventoEnvioLinkPagamento } from '../events/link-pagamento-gerado';

@Controller()
export class EmailLinkPagamentoController {
  private readonly _logger = new Logger(EmailLinkPagamentoController.name);

  constructor(private readonly _emailService: EmailService) {}

  @EventPattern(EVENTO_ENVIO_LINK_PAGAMENTO)
  handleEnvioLinkPagamento(evento: EventoEnvioLinkPagamento) {
    const email = evento.email;
    const assunto = `Link para pagamento da devolução - ${evento.mesReferencia}/${evento.anoReferencia}`;
    const mensagem = this._montarMensagem(evento);

    this._emailService
      .enviar({
        endereco: email,
        assunto,
        texto: mensagem,
      })
      .subscribe({
        next: () => {
          this._logger.debug(`Email enviado com sucesso para ${email}`);
        },
        error: (err) => {
          this._logger.error(`Erro ao enviar email para ${email}:`, err);
        },
      });
  }

  private _montarMensagem(evento: EventoEnvioLinkPagamento) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <p>Olá ${evento.nome.split(' ')[0]},</p>
          <p>Foi gerado um link para pagamento da sua devolução referente ao período <strong>${evento.mesReferencia}/${evento.anoReferencia}</strong>.</p>
          <ul>
            <li>Valor do dízimo: <strong>R$ ${evento.valorComunhaoBens.toFixed(2)}</strong></li>
            <li>Valor do fundo de comunhão: <strong>R$ ${evento.valorFundoComunhao.toFixed(2)}</strong></li>
            <li>Forma de pagamento: <strong>${evento.formaPagamento}</strong></li>
          </ul>
          <p>Para realizar o pagamento, clique no link abaixo:</p>
          <p><a href="${evento.link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Realizar Pagamento</a></p>
          <p>Obrigado,<br/>Economato ${evento.setor}.</p>
        </body>
      </html>
    `;
  }
}
