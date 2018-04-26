import { ServicesWrapper } from '../../../services/services-wrapper';
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import { GET, META } from '../../../constants';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';

const QUERY_PROMPT = 'prompt';

export function googleUrlHandler(services: ServicesWrapper) {

  return {
    [GET]: getGoogleUrl
  };

  function getGoogleUrl(req: Request, res: Response, next: NextFunction) {

    const svc = services;
    const scopes = [
      'profile',
      'email'
    ];

    const oauthUrlOpts: {} = {
      access_type: 'offline',
      scope: scopes
    };

    // Prompting refreshes the access token.
    if (req.query[QUERY_PROMPT]) {
      svc.logger.debug('Google Oauth prompting for consent', req[META]);
      oauthUrlOpts[QUERY_PROMPT] = 'consent';
    }

    const url = svc.oauth2Client.generateAuthUrl(oauthUrlOpts);

    svc.logger.debug(`Redirecting to Google OAuth URL`, Object.assign({ url }, req[META]));

    res.redirect(302, url);
  }
}

export function googleCallbackHandler(services: ServicesWrapper) {

  return {
    [GET]: handleOAuthCallback
  };

  /**
   * Express handler to take the code from the Google OAuth callback and return a jwt.
   *
   * @param req
   * @param res
   * @param next
   */
  function handleOAuthCallback(req: Request, res: Response, next: NextFunction) {
    const svc = services;

    svc.logger.debug('Google OAuth Callback Started', req[META]);

    if (!req.query['code']) {
      svc.logger.warning('Google OAuth Callback Called Without Code', req[META]);
      res.status(400).json({ 'ERROR': 'code required' });
      return;
    }

    svc.oauth2Client.getToken(req.query['code'], async (err, tokens) => {
      if (err) {
        svc.logger.error('Failed to get Google OAuth token', Object.assign({ error: err }, req[META]));
        res.status(500).json({ 'ERROR': err.message });
        return;
      }

      svc.logger.debug('Recieved OAuth Tokens', Object.assign({ tokens }, req[META]));

      try {
        // Token you recieve is JWT. Using Google's oauth2Client it will validate that it came from Google
        const ticket = await svc.oauth2Client.verifyIdToken({
          idToken: tokens['id_token'],
          audience: process.env['G_OAUTH_CLIENT_ID']
        });

        const payload = ticket.getPayload();

        // The sub (subject) key in the token is a unique identifier that doesn't change.
        // We're going to check for any users with that sub.
        let user = await svc.models.User.findOne({
          include: [{
            model: svc.models.googleOAuth,
            where: { sub: payload['sub'] }
          }]
        });


        if (!user) {
          // No user existed with that sub so we'll create one
          user = await svc.models.User.create({
            name: payload['name'],
            email: payload['email'],
            googleOAuth: {
              sub: payload['sub'],
              googleAccessToken: tokens['access_token'],
              googleRefreshToken: tokens['refresh_token']
            }
          }, { include: [svc.models.googleOAuth] });
          svc.logger.info('Created User', Object.assign({ user: user.get({ plain: true }) }, req[META]));
        } else {
          // A user already existed, but we did get new oAuth tokens. So we'll update them.
          // If you've already asked for a users permission you wont get another refresh token.
          // We check for both tokens though, because I don't want to overwrite their current ones in
          // the database with undefined values.
          svc.logger.debug('Found User', Object.assign({ user: user['id'] }, req[META]));
          let tokensChanged = false;
          if (tokens['access_token']) {
            user.googleOAuth.googleAccessToken = tokens['access_token'];
            tokensChanged = true;
          }
          if (tokens['refresh_token']) {
            user.googleOAuth.googleRefreshToken = tokens['refresh_token'];
            tokensChanged = true;
          }

          if (tokensChanged) {
            user.googleOAuth.save().then(oauth => {
              svc.logger.debug('OAuth Tokens Updated', Object.assign({ tokens: oauth.get({ plain: true }) }, req[META]));
            }).catch(saveErr => {
              svc.logger.error('Failed to save updated OAuth Tokens', Object.assign({ error: saveErr }, req[META]));
            });
          }
        }

        // Send the user their token.
        // We put the token in the cookie, as well as send it as the response.
        // This is so the application can send an authorization header as well as the cookie
        // Probalby should use different tokens for each.
        svc.auth.getToken(user['id']).then(token => {
          res.cookie('auth', token, { httpOnly: true });
          return res.json(token);
        });
      } catch (error) {
        svc.logger.warn('Authentication Failed', Object.assign(req[META], { error: error }));
        res.status(500).json({ 'ERROR': 'Authentication Failed' });
      }
    });
  }
}
