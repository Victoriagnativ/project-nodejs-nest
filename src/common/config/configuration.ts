import * as process from 'node:process';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
  },
});
