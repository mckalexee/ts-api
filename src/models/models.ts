import { User } from './user.model';
import { googleOAuth } from './oauth.model';
import * as sequelize from 'sequelize';

export const models = {
  User,
  googleOAuth
};
