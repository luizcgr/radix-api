import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { CLIENT_NATS } from 'src/constants';
import { QueueMessage } from './queue-message';

@Injectable()
export class MensageriaService {
  private readonly _logger = new Logger(MensageriaService.name);

  constructor(
    @Inject(CLIENT_NATS)
    private readonly _client: ClientNats,
  ) {}

  push({ queue, content }: QueueMessage) {
    this._client.send(queue, content).subscribe({
      next: (response) => {
        this._logger.debug(`Mensagem enviada para a fila ${queue}`, response);
      },
      error: (error) => {
        this._logger.error(
          `Erro ao enviar mensagem para a fila de notificação ${queue}`,
          error,
        );
      },
    });
  }
}
