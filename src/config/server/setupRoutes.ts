import { Express, Router } from 'express';
import { readdirSync } from 'fs';
import { resolve } from 'path';

export const setupRoutes = (app: Express) => {
  const router = Router();

  app.use('/api/v1', router);
  readdirSync(resolve(__dirname, 'routes')).map(async (file) => {
    if (!file.includes('.test.')) {
      (await import(`./routes/${file}`)).default(router);
    }
  });
};
