import { DataTypes, QueryInterface, Transaction } from 'sequelize';
import { HashSenha } from '../../auth/classes/hash-senha';

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.createTable(
        'tb_pessoa',
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
          cpf: {
            type: Sequelize.STRING(11),
            allowNull: false,
            unique: true,
          },
          email: {
            type: Sequelize.STRING(300),
            allowNull: false,
            unique: true,
          },
          senha: {
            type: Sequelize.STRING(60),
            allowNull: false,
          },
          celula_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('tb_pessoa', ['celula_id'], {
        name: 'idx_pessoa_celula_id',
        unique: false,
        transaction,
      });

      await queryInterface.addConstraint('tb_pessoa', {
        fields: ['celula_id'],
        type: 'foreign key',
        name: 'fk_pessoa_celula',
        references: {
          table: 'tb_celula',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        transaction,
      });

      return queryInterface.bulkInsert(
        'tb_pessoa',
        [
          {
            nome: 'Luiz Reis',
            cpf: '83810420115',
            email: 'luizcgr@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 8,
          },
          {
            nome: 'Matheus Tonhá',
            cpf: '44855404055',
            email: 'matheusrtonha@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 8,
          },
          {
            nome: 'Iran Silva',
            cpf: '80278949053',
            email: 'pereirairan402@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 8,
          },
        ],
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      return queryInterface.dropTable('tb_pessoa', { transaction });
    }),
};
