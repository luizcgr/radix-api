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
  declare nome: string;
  @Column({ field: 'setor_id', allowNull: false })
  declare setorId: number;

  @BelongsTo(() => SetorModel, 'setor_id')
  declare setor: SetorModel;
}
