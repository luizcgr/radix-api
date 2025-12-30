import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_permissao',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT,
          },
          pessoa_id: {
            type: Sequelize.BIGINT,
            unique: true,
            allowNull: false,
          },
          missao: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          setor: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          celula: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_permissao', ['pessoa_id'], {
        name: 'idx_permissao_pessoa_id',
        unique: true,
        transaction,
      });

      await queryInterface.addConstraint('tb_permissao', {
        fields: ['pessoa_id'],
        type: 'foreign key',
        name: 'fk_permissao_pessoa',
        references: {
          table: 'tb_pessoa',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        transaction,
      });

      await queryInterface.sequelize.query(
        `
            insert into tb_permissao (
                pessoa_id, missao, setor, celula
            ) (
                select                 
                    id, true, true, true
                from 
                    tb_pessoa
            );
        `,
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_permissao', { transaction });
    }),
};
