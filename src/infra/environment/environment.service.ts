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
}

@Injectable()
export class Environment {
  readonly database: DatabaseConfig;
  readonly jwt: JwtConfig

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
    }
  }
}
