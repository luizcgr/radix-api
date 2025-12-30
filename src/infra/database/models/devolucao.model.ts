import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { StatusDevolucao } from 'src/modules/devolucao/types/status-devolucao';
import { PessoaModel } from './pessoa.model';

@Table({ tableName: 'tb_devolucao', timestamps: false })
export class DevolucaoModel extends Model<DevolucaoModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ field: 'data_criacao', allowNull: false })
  declare dataCriacao: Date;
  @Column({ field: 'mes_referencia', allowNull: false })
  declare mesReferencia: number;
  @Column({ field: 'ano_referencia', allowNull: false })
  declare anoReferencia: number;
  @Column({ field: 'valor_total', allowNull: false })
  declare valorTotal: number;
  @Column({ field: 'pessoa_id', allowNull: false })
  declare pessoaId: number;
  @Column({ field: 'status', allowNull: false })
  declare status: StatusDevolucao;
  @Column({ field: 'data_pagamento', allowNull: true })
  declare dataPagamento?: Date;
  @Column({ field: 'pagamento_id', allowNull: false })
  declare pagamentoId: string;
  @Column({ field: 'url_pagamento', allowNull: false })
  declare urlPagamento: string;
  @Column({ field: 'numero_pagamento', allowNull: false })
  declare numeroPagamento: string;
  @Column({ field: 'codigo_cliente', allowNull: false })
  declare codigoCliente: string;

  @BelongsTo(() => PessoaModel, 'pessoa_id')
  declare pessoa: PessoaModel;
}
