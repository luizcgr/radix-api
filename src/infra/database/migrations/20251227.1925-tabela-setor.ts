import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_setor',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT,
          },
          nome: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          missao_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_setor', ['missao_id'], {
        name: 'idx_setor_missao_id',
        unique: false,
        transaction,
      });

      await queryInterface.addConstraint('tb_setor', {
        fields: ['missao_id'],
        type: 'foreign key',
        name: 'fk_setor_missao',
        references: {
          table: 'tb_missao',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        transaction,
      });

      return queryInterface.bulkInsert(
        'tb_setor',
        [
          {
            nome: 'Asa Sul',
            missao_id: 1,
          },
          {
            nome: 'Taguatinga',
            missao_id: 1,
          },
          {
            nome: 'Santa Maria',
            missao_id: 1,
          },
        ],
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_setor', { transaction });
    }),
};
