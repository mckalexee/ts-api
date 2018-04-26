import * as express from 'express';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import { ServicesWrapper } from './services/services-wrapper';
import { handlers } from './routes/handlers';
import { initRoutes } from './routes/routes';
import { noCache } from './middleware/nocache.middleware';
import { addReqID } from './middleware/add-req-id.middleware';
import { authMiddleWare } from './middleware/auth.middleware';

const ETAG = 'etag';
const X_POWERED_BY = 'x-powered-by';


export interface ServerOpts {
  port?: string | number;
}

/**
 * By having the server in a class, we can spin up muliple servers if we want to.
 */
export class Server {
  private _app: express.Application;
  private _port: string | number;
  private _services: ServicesWrapper;


  constructor(opts: ServerOpts) {
    this._services = new ServicesWrapper();
    this._port = opts.port || 8080;
    this._app = express();
    // By disabling the etag we can get a bit of performance
    this._app.set(ETAG, false);
    // Disable x-powered-by header
    this._app.disable(X_POWERED_BY);
    // Add a parser for the cookies
    this._app.use(cookieParser());
    // Add an ID to each request
    this._app.use(addReqID);
    // Auth Middleware
    this._app.use(authMiddleWare(this._services));
    // Disable caching of responses
    this._app.use(noCache);
    // Allow any domain to hit the CORS endpoint
    this._app.use(cors({ origin: true, credentials: true }));
    // Here's where the routes are loades
    this._app.use(initRoutes(handlers, this._services));

  }

  start() {
    this.syncDatabase();
  }

  syncDatabase() {

    // Object.keys(this._services.models).forEach(async (key) => {
    //   this._services.models[key].sync();
    // });

    this._services.sequelize.sync().then(() => {
      this.listen();
    });
  }

  listen(...args) {
    this._app.listen(this._port, () => {
      this._services.logger.info(`Server listening on: ${this._port}`);
    });
  }

}
