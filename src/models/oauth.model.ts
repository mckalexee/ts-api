import { sequelize } from '../services/sequelize.service';
import { User } from './user.model';
import * as Sequelize from 'sequelize';

export interface OAuthGoogleAddModel {
  sub?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
}

export interface OAuthGoogleModel extends Sequelize.Instance<OAuthGoogleModel> {
  id?: number;
  sub?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
}


export const googleOAuth = sequelize.define<OAuthGoogleModel, OAuthGoogleAddModel>('googleOAuth', {
  sub: {
    type: Sequelize.STRING
  },
  googleAccessToken: Sequelize.STRING,
  googleRefreshToken: Sequelize.STRING
});

User.hasOne(googleOAuth);
googleOAuth.belongsTo(User);
