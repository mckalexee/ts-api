import * as jwt from 'jsonwebtoken';
import { logger } from './logging.service';
import { USER_ID } from '../constants';

export class AuthService {
  private _key: string;

  constructor(key = 'secret') {
    this._key = key;
  }

  getToken(userID: number): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign({ [USER_ID]: userID }, this._key, {
        expiresIn: 60 * 60 * 24 * 7
      }, (err, token) => {
        if (err) {
          logger.error(`Failed to sign token`, { error: err, [USER_ID]: userID });
          reject(err);
          return;
        }
        logger.debug(`Created token for user`, { [USER_ID]: userID });
        resolve(token);
      });
    });
  }

  verifyToken(token: string): Promise<string | object> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._key, (err, decoded) => {
        if (err) {
          logger.error(`Failed to verify token`, { token: token, error: err });
          reject(err);
          return;
        }
        logger.debug(`Verified token.`, { decoded });
        resolve(decoded);
      });
    });
  }

}
