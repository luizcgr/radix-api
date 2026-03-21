import { DataTypes, QueryInterface, Transaction } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.addColumn(
        'tb_permissao',
        'admin',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
            update tb_permissao
            set admin = true
            where pessoa_id in (
              select id from tb_pessoa where email in ('luizcgr@gmail.com', 'matheusrtonha@gmail.com', 'pereirairan402@gmail.com')
            );
          `,
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.removeColumn('tb_permissao', 'admin', {
        transaction,
      });
    }),
};
