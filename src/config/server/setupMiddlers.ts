import cors from 'cors';
import { Express, json, urlencoded } from 'express';

export const setupMiddlers = (app: Express) => {
  const middlers = [cors(), json(), urlencoded({ extended: true })];

  middlers.forEach((middleware) => app.use(middleware));
};
