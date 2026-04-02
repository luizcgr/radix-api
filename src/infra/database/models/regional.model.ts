import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'tb_regional', timestamps: false })
export class RegionalModel extends Model<RegionalModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;
  @Column({ allowNull: false })
  declare nome: string;
  @Column({ allowNull: false, defaultValue: true })
  declare ativo: boolean;
}
