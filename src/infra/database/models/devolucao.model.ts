import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { PessoaModel } from './pessoa.model';

@Table({ tableName: 'tb_devolucao', timestamps: false })
export class DevolucaoModel extends Model<DevolucaoModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ field: 'data', allowNull: false })
  declare data: Date;
  @Column({ field: 'mes_referencia', allowNull: false })
  declare mesReferencia: number;
  @Column({ field: 'ano_referencia', allowNull: false })
  declare anoReferencia: number;
  @Column({ field: 'valor_total', allowNull: false })
  declare valorTotal: number;
  @Column({ field: 'pessoa_id', allowNull: false })
  declare pessoaId: number;
  @Column({ field: 'status', allowNull: false })
  declare status: string;

  @Column({ field: 'assas_payment_id', allowNull: false })
  declare assasPaymentId: string;
  @Column({ field: 'asaas_payment_invoice_url', allowNull: false })
  declare asaasPaymentInvoiceUrl: string;
  @Column({ field: 'asaas_payment_invoice_number', allowNull: false })
  declare asaasPaymentInvoiceNumber: string;
  @Column({ field: 'asaas_payment_customer', allowNull: false })
  declare asaasPaymentCustomer: string;

  @BelongsTo(() => PessoaModel, 'pessoa_id')
  pessoa: PessoaModel;
}
