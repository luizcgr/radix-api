import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_regional',
        {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          nome: {
            type: Sequelize.STRING,
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

      await queryInterface.bulkInsert(
        'tb_regional',
        [{ nome: 'Centro-Oeste' }],
        { transaction },
      );

      await queryInterface.addColumn(
        'tb_missao',
        'regional_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tb_regional',
            key: 'id',
          },
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `UPDATE tb_missao SET regional_id = (SELECT MAX(id) FROM tb_regional)`,
        { transaction },
      );

      await queryInterface.changeColumn(
        'tb_missao',
        'regional_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tb_regional',
            key: 'id',
          },
        },
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.removeColumn('tb_missao', 'regional_id', {
        transaction,
      });
      await queryInterface.dropTable('tb_regional', { transaction });
    }),
};
