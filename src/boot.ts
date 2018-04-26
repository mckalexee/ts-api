import { Server } from './server';

const server = new Server({port: process.env.PORT || 8080});

server.start();
