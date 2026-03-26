import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.addColumn(
        'tb_devolucao',
        'data_email_confirmacao',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.removeColumn(
        'tb_devolucao',
        'data_email_confirmacao',
        { transaction },
      );
    }),
};
