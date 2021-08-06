import 'reflect-metadata';
import '@shared/container';
import { config } from 'dotenv';
import express from 'express';

config();

const app = express();

export { app };
