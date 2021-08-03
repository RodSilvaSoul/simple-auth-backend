import 'reflect-metadata';
import { config } from 'dotenv';
import express from 'express';
import '@shared/container';

import { setupMiddlers } from './setupMiddlers';
import { setupRoutes } from './setupRoutes';

config();

const app = express();

setupMiddlers(app);
setupRoutes(app);

export { app };
