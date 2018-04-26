import * as Sequelize from 'sequelize';
import { logger } from '../services/logging.service';



export const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
  dialect: 'mysql',
  operatorsAliases: false,
  dialectOptions: {
    socketPath: (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') ?
      `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}` : null,
  },
  logging: query => {
    logger.debug('SQL QUERY', {query});
  },

  pool: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 10000
  },

  define: {
    timestamps: true
  }
});

sequelize.authenticate()
  .then(() => {
    logger.info('DB Conneciton Established');
  })
  .catch(err => {
    throw err;
  });
