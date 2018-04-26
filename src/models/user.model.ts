import { sequelize } from '../services/sequelize.service';
import { OAuthGoogleModel, OAuthGoogleAddModel } from './oauth.model';
import * as Sequelize from 'sequelize';

export interface UserAddModel {
  name?: string;
  email?: string;
  googleOAuth?: OAuthGoogleAddModel;
}

export interface UserModel extends Sequelize.Instance<UserModel> {
  id?: number;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  googleOAuth?: OAuthGoogleModel;
}

export const User = sequelize.define<UserModel, UserAddModel>('user', {
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  }
});
