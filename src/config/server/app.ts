import 'reflect-metadata';
import { config } from 'dotenv';
import express from 'express';
import '@shared/container';

import { setupMiddlewares } from './setupMiddlewares';
import { setupRoutes } from './setupRoutes';

config();

const app = express();

setupMiddlewares(app);
setupRoutes(app);

export { app };
