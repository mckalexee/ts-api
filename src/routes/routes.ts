import { Router } from 'express';
import { Handlers } from './handlers';
import { ServicesWrapper } from '../services/services-wrapper';
import { REQUEST_TYPES } from '../constants';

// Handlers

export function initRoutes(handlers: Handlers, services: ServicesWrapper) {
  const router = Router();

  for (const [route, handler] of handlers) {
    const h = handler(services);
    for (const type of REQUEST_TYPES) {
      if (h[type]) {
        router[type](route, h[type]);
      }
    }
  }

  return router;
}
