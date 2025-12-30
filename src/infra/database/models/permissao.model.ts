import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { PessoaModel } from './pessoa.model';

@Table({ tableName: 'tb_permissao', timestamps: false })
export class PermissaoModel extends Model<PermissaoModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ field: 'pessoa_id', allowNull: false, unique: true })
  declare pessoaId: number;
  @Column({ allowNull: false, defaultValue: false })
  declare missao: boolean;
  @Column({ allowNull: false, defaultValue: false })
  declare setor: boolean;
  @Column({ allowNull: false, defaultValue: false })
  declare celula: boolean;
  @BelongsTo(() => PessoaModel, 'pessoaId')
  declare pessoa: PessoaModel;
}
