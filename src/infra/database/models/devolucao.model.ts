import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { FormaPagamento } from 'src/modules/cobranca/types/forma-pagamento';
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
  @Column({ field: 'valor_dizimo', allowNull: false })
  declare valorDizimo: number;
  @Column({ field: 'valor_fundo_comunhao', allowNull: false })
  declare valorFundoComunhao: number;
  @Column({ field: 'forma_pagamento', allowNull: false })
  declare formaPagamento: FormaPagamento;
  @Column({
    field: 'pessoa_id',
    allowNull: false,
    type: DataType.BIGINT,
  })
  declare pessoaId: number;
  @Column({ field: 'solicitante_id', allowNull: false })
  declare solicitanteId: number;
  @Column({
    field: 'status',
    allowNull: false,
    type: DataType.STRING(20),
  })
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

  @Column({ field: 'data_email_confirmacao', allowNull: true })
  declare dataEmailConfirmacao?: Date;

  @BelongsTo(() => PessoaModel, 'pessoa_id')
  declare pessoa: PessoaModel;
  @BelongsTo(() => PessoaModel, 'solicitante_id')
  declare solicitante: PessoaModel;
}
