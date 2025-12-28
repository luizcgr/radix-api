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
  nome: string;
  @Column({ allowNull: false })
  ativo: boolean;
}
