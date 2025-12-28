import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_celula',
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
          setor_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_celula', ['setor_id'], {
        name: 'idx_celula_setor_id',
        unique: false,
        transaction,
      });

      await queryInterface.addConstraint('tb_celula', {
        fields: ['setor_id'],
        type: 'foreign key',
        name: 'fk_celula_setor',
        references: {
          table: 'tb_setor',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        transaction,
      });

      return queryInterface.bulkInsert(
        'tb_celula',
        [
          {
            nome: 'P1 e P2',
            setor_id: 1,
          },
          {
            nome: 'D1 e D2',
            setor_id: 1,
          },
          {
            nome: 'Consagrados',
            setor_id: 1,
          },
          {
            nome: 'Definitivos',
            setor_id: 1,
          },
          {
            nome: 'P1',
            setor_id: 2,
          },
          {
            nome: 'P2',
            setor_id: 2,
          },
          {
            nome: 'D1 e D2',
            setor_id: 2,
          },
          {
            nome: 'Consagrados',
            setor_id: 2,
          },
          {
            nome: 'Única',
            setor_id: 3,
          },
        ],
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_celula', { transaction });
    }),
};
