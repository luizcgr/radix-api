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
          data_criacao: {
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
          solicitante_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
          data_pagamento: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          pagamento_id: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true,
          },
          url_pagamento: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true,
          },
          numero_pagamento: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true,
          },
          codigo_cliente: {
            type: Sequelize.TEXT,
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

      await queryInterface.addIndex('tb_devolucao', ['pagamento_id'], {
        name: 'idx_devolucao_pagamento_id',
        unique: true,
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

      await queryInterface.addConstraint('tb_devolucao', {
        fields: ['solicitante_id'],
        type: 'foreign key',
        name: 'fk_devolucao_pessoa_solicitante',
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
