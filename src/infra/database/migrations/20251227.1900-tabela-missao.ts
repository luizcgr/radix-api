import { QueryInterface, DataTypes, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_missao',
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
          cnpj: {
            type: Sequelize.STRING(14),
            allowNull: false,
          },
          ativo: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_missao', ['cnpj'], {
        name: 'idx_missao_cnpj',
        unique: true,
        transaction,
      });

      return queryInterface.bulkInsert(
        'tb_missao',
        [
          {
            nome: 'Brasília',
            cnpj: '07044456002901',
            ativo: true,
          },
        ],
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_missao', { transaction });
    }),
};
