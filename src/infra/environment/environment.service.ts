import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type DatabaseConfig = {
  port: number;
  host: string;
  username: string;
  password: string;
  name: string;
  showLogs: boolean;
};

type JwtConfig = {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
};

type AsaasConfig = {
  token: string;
  url: string;
  webhookAccessToken: string;
};

interface EmailConfig {
  from: string;
  user: string;
  password: string;
  host: string;
  port: number;
}

type NatsConfig = {
  url: string;
};

@Injectable()
export class Environment {
  readonly database: DatabaseConfig;
  readonly jwt: JwtConfig;
  readonly asaas: AsaasConfig;
  readonly email: EmailConfig;
  readonly nats: NatsConfig;

  constructor(configService: ConfigService) {
    this.database = {
      name: configService.get('RADIX_DATABASE_NAME') || 'radix',
      host: configService.get('RADIX_DATABASE_HOST') || 'radix-postgres',
      password: configService.get('RADIX_DABASE_PASSWORD') || 'senha123',
      port: +configService.get('RADIX_DATABASE_PORT') || 5432,
      username: configService.get('RADIX_DATABASE_USERNAME') || 'postgres',
      showLogs: configService.get('RADIX_DATABASE_SHOW_LOGS') === 'true',
    };
    this.jwt = {
      secret: configService.get('JWT_SECRET')!,
      expiresIn: configService.get('JWT_EXPIRES_IN')!,
      refreshExpiresIn: configService.get('JWT_REFRESH_EXPIRES_IN')!,
    };
    this.asaas = {
      token: configService.get('ASAAS_API_TOKEN')!,
      url: configService.get('ASAAS_API_URL')!,
      webhookAccessToken: configService.get('ASAAS_WEBHOOK_ACCESS_TOKEN')!,
    };
    this.email = {
      user: configService.get('EMAIL_USER')!,
      password: configService.get('EMAIL_PASSWORD')!,
      from: configService.get('EMAIL_FROM')!,
      host: configService.get('EMAIL_HOST')!,
      port: +configService.get('EMAIL_PORT')!,
    };
    this.nats = {
      url: configService.get('NATS_URL')!,
    };
  }
}
