import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import '@shared/container';

import { setupMiddlewares } from './setupMiddlewares';
import { setupRoutes } from './setupRoutes';

const app = express();

setupMiddlewares(app);
setupRoutes(app);

export { app };
