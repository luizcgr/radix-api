import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { SetorModel } from './setor.model';

@Table({ tableName: 'tb_celula', timestamps: false })
export class CelulaModel extends Model<CelulaModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ allowNull: false })
  nome: string;
  @Column({ field: 'setor_id', allowNull: false })
  setorId: number;

  @BelongsTo(() => SetorModel, 'setor_id')
  setor: SetorModel;
}
