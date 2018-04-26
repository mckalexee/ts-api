import { Request, Response, NextFunction } from 'express';
import * as uuid from 'uuid';

export function addReqID(req: Request, res: Response, next: NextFunction) {
  req['id'] = uuid.v1();
  req['meta'] = {
    request: req['id'],
    path: req.url,
    method: req.method
  };
  next();
}
