import { ServicesWrapper } from '../services/services-wrapper';
import { RequestHandler } from 'express';
import { rootHandler } from './handlers/root.handler';
import {
  googleUrlHandler,
  googleCallbackHandler
} from './handlers/oauth/google.oauth';
import { userHandler } from './handlers/user/user.handler';
import { healthCheckHandler } from './handlers/health-check/health-check.handler';
import { REQUEST_TYPES, GET, DELETE, POST, PUT } from '../constants';

type Handler = typeof rootHandler;
export type Handlers = Map<string, Handler>;

export const handlers: Handlers = new Map([
  ['/', rootHandler],
  ['/_ah/health', healthCheckHandler],
  ['/oauth/google', googleUrlHandler],
  ['/oauth/google/callback', googleCallbackHandler],
  ['/user/', userHandler],
  ['/user/:id', userHandler],
]);
