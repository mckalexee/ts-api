import { ServicesWrapper } from '../../services/services-wrapper';
import { Request, Response, NextFunction } from 'express';
import { GET } from '../../constants';

export function rootHandler(services: ServicesWrapper) {
  return {
    [GET] : getRoot
  };

  function getRoot(req: Request, res: Response, next: NextFunction) {
    const svc = services;
    res.json({hello: 'world'});
  }



}
