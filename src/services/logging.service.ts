import { Logger, TransportInstance, transports } from 'winston';
// import { LoggingWinston } from '@google-cloud/logging-winston';

const transportInstances: TransportInstance[] = [];

if (process.env.NODE_ENV === 'production') {
  // const loggingWinston = new LoggingWinston();
  // transportInstances.push(loggingWinston);
} else {
  const Console = new transports.Console();
  transportInstances.push(Console);
}

export const logger = new Logger({
  level: 'debug',
  transports: transportInstances
});

// Add metadata about gcloud instance in production to the logs
if (process.env.NODE_ENV === 'production') {
  logger.rewriters.push((level, msg, meta) => {
    meta.gae = {
      deploymentId: process.env['GAE_DEPLOYMENT_ID'],
      instance: process.env['GAE_INSTANCE'],
      service: process.env['GAE_SERVICE'],
      version: process.env['GAE_VERSION']
    };
    return meta;
  });
}
