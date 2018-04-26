import { oauth2Client } from './oauth.google.service';
import { sequelize } from './sequelize.service';
import { models } from '../models/models';
import { logger } from './logging.service';
import { AuthService } from './auth.service';

export class ServicesWrapper {
  oauth2Client = oauth2Client;
  sequelize = sequelize;
  models = models;
  logger = logger;
  auth: AuthService;

  constructor() {
    this.auth = new AuthService;
  }
}
