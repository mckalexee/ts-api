import { ServicesWrapper } from '../../../services/services-wrapper';
import { Request, Response, NextFunction } from 'express';
import { GET, META, USER_ID } from '../../../constants';

export function healthCheckHandler(services: ServicesWrapper) {


  return {
    [GET]: checkHealth
  };

  function checkHealth(req: Request, res: Response) {
    res.json({'STATUS': 'OK'});
  }

}
