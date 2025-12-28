import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { RADIX_DS } from 'src/constants';
import { Environment } from '../environment/environment.service';
import { CelulaModel } from './models/celula.model';
import { MissaoModel } from './models/missao.model';
import { PessoaModel } from './models/pessoa.model';
import { SetorModel } from './models/setor.model';
import * as cls from 'cls-hooked';

const logger = new Logger('Sequelize');

let sequelizeDatasource: Sequelize | undefined;

export const getSequelizeDatasource = (): Sequelize => {
  return sequelizeDatasource!;
};
export const databaseProviders = [
  {
    provide: RADIX_DS,
    useFactory: async ({ database: radixDatabase }: Environment) => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: radixDatabase.host,
        port: radixDatabase.port,
        username: radixDatabase.username,
        password: radixDatabase.password,
        database: radixDatabase.name,
        logging: (log) => {
          if (radixDatabase.showLogs) {
            logger.log(log);
          }
        },
      });
      const namespace = cls.createNamespace('sequelize-transaction-namespace');
      Sequelize.useCLS(namespace);
      sequelize.addModels([MissaoModel, SetorModel, CelulaModel, PessoaModel]);
      await sequelize.sync();
      sequelizeDatasource = sequelize;
      return sequelize;
    },
    inject: [Environment],
  },
];
