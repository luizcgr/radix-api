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

      await queryInterface.bulkInsert(
        'tb_pessoa',
        [
          {
            nome: 'Luiz Reis',
            cpf: '83810420115',
            email: 'luizcgr@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 2,
          },
          {
            nome: 'Matheus Tonhá',
            cpf: '44855404055',
            email: 'matheusrtonha@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 2,
          },
          {
            nome: 'Iran Silva',
            cpf: '80278949053',
            email: 'pereirairan402@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 2,
          },
          {
            nome: 'João Silva',
            cpf: '12345678901',
            email: 'joaosilva@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 1,
          },
          {
            nome: 'Maria Souza',
            cpf: '98765432100',
            email: 'mariasouza@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 1,
          },
          {
            nome: 'Carlos Lima',
            cpf: '45678912300',
            email: 'carloslima@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 3,
          },
          {
            nome: 'Ana Paula',
            cpf: '32165498700',
            email: 'anapaula@gmail.com',
            senha: new HashSenha('senha123').value,
            celula_id: 3,
          },
        ],
        { transaction },
      );
    }),
  down: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async (transaction: Transaction) => {
      await queryInterface.dropTable('tb_pessoa', { transaction });
    }),
};
