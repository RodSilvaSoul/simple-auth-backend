export type HttpRequest = {
  body?: any;
  params?: any;
  query?:any
};

export type HttpResponse = {
  body?: any;
  statusCode: number;
};
