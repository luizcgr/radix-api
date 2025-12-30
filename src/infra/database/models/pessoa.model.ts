import {
  AutoIncrement,
  BelongsTo,
  Column,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CelulaModel } from './celula.model';
import { PermissaoModel } from './permissao.model';

@Table({ tableName: 'tb_pessoa', timestamps: false })
export class PessoaModel extends Model<PessoaModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ field: 'nome', allowNull: false })
  declare nome: string;
  @Column({ field: 'cpf', allowNull: false, unique: true })
  declare cpf: string;
  @Column({ field: 'email', allowNull: false })
  declare email: string;
  @Column({ field: 'senha', allowNull: false })
  declare senha: string;
  @Column({ field: 'celula_id', allowNull: false })
  declare celulaId: number;

  @BelongsTo(() => CelulaModel, 'celula_id')
  declare celula: CelulaModel;
  @HasOne(() => PermissaoModel, 'pessoa_id')
  declare permissao: PermissaoModel;
}
