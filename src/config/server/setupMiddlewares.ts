import cors from 'cors';
import { Express, json, urlencoded } from 'express';

export const setupMiddlewares = (app: Express) => {
  const middlewares = [cors(), json(), urlencoded({ extended: true })];

  middlewares.forEach((middleware) => app.use(middleware));
};
