import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { RegionalModel } from './regional.model';

@Table({ tableName: 'tb_missao', timestamps: false })
export class MissaoModel extends Model<MissaoModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ allowNull: false })
  declare nome: string;
  @Column({ allowNull: false, defaultValue: true })
  declare ativo: boolean;
  @Column({ field: 'regional_id', allowNull: false })
  declare regionalId: number;

  @BelongsTo(() => RegionalModel, 'regional_id')
  declare regional: RegionalModel;
}
