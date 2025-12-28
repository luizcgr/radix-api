import dotenv from 'dotenv';

dotenv.config();

const {
  RADIX_DATABASE_USERNAME,
  RADIX_DATABASE_PASSWORD,
  RADIX_DATABASE_HOST,
  RADIX_DATABASE_PORT,
  RADIX_DATABASE_NAME,
} = process.env;

console.log('Database Configuration:');
console.log('Username:', RADIX_DATABASE_USERNAME);
console.log('Password:', RADIX_DATABASE_PASSWORD ? '***' : undefined);
console.log('Host:', RADIX_DATABASE_HOST);
console.log('Port:', RADIX_DATABASE_PORT);
console.log('Database:', RADIX_DATABASE_NAME);

export = {
  development: {
    username: RADIX_DATABASE_USERNAME,
    password: RADIX_DATABASE_PASSWORD,
    database: RADIX_DATABASE_NAME,
    host: RADIX_DATABASE_HOST,
    port: RADIX_DATABASE_PORT,
    dialect: 'postgres',
    migrationStorageTableName: 'tb_sequelize_meta',
  },
  production: {
    username: RADIX_DATABASE_USERNAME,
    password: RADIX_DATABASE_PASSWORD,
    database: RADIX_DATABASE_NAME,
    host: RADIX_DATABASE_HOST,
    port: RADIX_DATABASE_PORT,
    dialect: 'postgres',
    migrationStorageTableName: 'tb_sequelize_meta',
  },
};
