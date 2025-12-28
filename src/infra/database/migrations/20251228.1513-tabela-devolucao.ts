import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_devolucao',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT,
          },
          status: {
            type: Sequelize.STRING(20),
            allowNull: false,
          },
          data: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          mes_referencia: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          ano_referencia: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          valor_total: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
          },
          pessoa_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
          assas_payment_id: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
          },
          asaas_payment_invoice_url: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
          },
          asaas_payment_invoice_number: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
          },
          asaas_payment_customer: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_devolucao', ['pessoa_id'], {
        name: 'idx_devolucao_pessoa_id',
        unique: false,
        transaction,
      });

      await queryInterface.addConstraint('tb_devolucao', {
        fields: ['pessoa_id'],
        type: 'foreign key',
        name: 'fk_devolucao_pessoa',
        references: {
          table: 'tb_pessoa',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        transaction,
      });
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_devolucao', { transaction });
    }),
};
