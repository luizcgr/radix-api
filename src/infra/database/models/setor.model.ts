import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MissaoModel } from './missao.model';

@Table({ tableName: 'tb_setor', timestamps: false })
export class SetorModel extends Model<SetorModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ allowNull: false })
  declare nome: string;
  @Column({ field: 'missao_id', allowNull: false })
  declare missaoId: number;

  @BelongsTo(() => MissaoModel, 'missao_id')
  declare missao: MissaoModel;
}
