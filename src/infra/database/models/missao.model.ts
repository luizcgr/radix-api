import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

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
}
