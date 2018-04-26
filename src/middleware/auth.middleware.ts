import { ServicesWrapper } from '../services/services-wrapper';
import { Request, Response, NextFunction } from 'express';
import { USER_ID, META } from '../constants';

const OAUTH_URL = '/oauth';
/** This URL is how GAE checks the health of the app. */
const HEALTH_CHECK_URL = '/_ah/health';

export function authMiddleWare(services: ServicesWrapper) {
  return function (req: Request, res: Response, next: NextFunction) {
    // Bypass authentication for oauth paths
    if (req.url.startsWith(OAUTH_URL) || req.url.startsWith(HEALTH_CHECK_URL)) {
      return next();
    }

    if (!req.cookies.auth) {
      res.set('WWW-Authenticate', 'Bearer');
      services.logger.debug('Unauthenticated Request', req[META]);
      return res.status(401).json({ 'ERROR': 'Not Authenticated' });
    }

    const token = req.cookies.auth;

    // We add the User ID to the request, so routes can just know what users making the request down line
    services.auth.verifyToken(token).then(decoded => {
      req[USER_ID] = decoded[USER_ID];
      next();
    }).catch(decodeErr => {
      services.logger.debug('Failed to Decode Auth Token', Object.assign({ error: decodeErr, token }, req[META]));
      return res.status(500).json({ 'ERROR': 'Invalid Token' });
    });

  };
}

