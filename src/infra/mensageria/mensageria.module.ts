import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLIENT_NATS } from 'src/constants';
import { Environment } from '../environment/environment.service';
import { MensageriaService } from './mensageria.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CLIENT_NATS,
        inject: [Environment],
        useFactory: (env: Environment) => {
          return {
            transport: Transport.NATS,
            options: {
              servers: [env.nats.url],
              reconnect: true,
              maxReconnectAttempts: -1,
              reconnectTimeWait: 2000,
              maxPingOut: 5,
              pingInterval: 10000,
            },
          };
        },
      },
    ]),
  ],
  providers: [MensageriaService],
  exports: [MensageriaService, ClientsModule],
})
export class MensageriaModule {}
