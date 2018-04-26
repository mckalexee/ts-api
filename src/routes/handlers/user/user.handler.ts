import { ServicesWrapper } from '../../../services/services-wrapper';
import { Request, Response, NextFunction } from 'express';
import { GET, META, USER_ID } from '../../../constants';

export function userHandler(services: ServicesWrapper) {
  const ID_PARAM = 'id';

  return {
    [GET]: getUser
  };

  function getUser(req: Request, res: Response) {
    const svc = services;
    let id = req.params[ID_PARAM];
    if (!id) {
      id = req[USER_ID];
    }

    // Currently only the same user can access their info.
    if (String(req[USER_ID]) !== String(id)) {
      res.status(403).send({'ERROR': 'Unauthorized'});
    }



    svc.models.User.findById(id, {
      attributes: ['id', 'name', 'email']
    }).then(user => {
      svc.logger.debug(`Returned User: ${id}`, {
        request: req['id'],
        path: req.url,
        method: req.method
      });
      res.json(user);
    }).catch(err => {
      svc.logger.error('Error looking up user', {
        request: req['id'],
        path: req.url,
        method: req.method
      });
    });
  }
}
