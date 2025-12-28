import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CelulaModel } from './celula.model';

@Table({ tableName: 'tb_pessoa', timestamps: false })
export class PessoaModel extends Model<PessoaModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ field: 'nome', allowNull: false })
  declare nome: string;
  @Column({ field: 'email', allowNull: false })
  declare email: string;
  @Column({ field: 'senha', allowNull: false })
  declare senha: string;
  @Column({ field: 'celula_id', allowNull: false })
  declare celulaId: number;

  @BelongsTo(() => CelulaModel, 'celula_id')
  celula: CelulaModel;
}
