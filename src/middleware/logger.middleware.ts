import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly httpRequestLogger = new Logger('HttpRequest');
  private readonly httpResponseLogger = new Logger('HttpResponse');

  // TODO: Implement adding APIGW requestId from context in logging
  use(req: Request, res: Response, next: NextFunction) {
    /**
     * added logging for unhandledRejections
     */
    process.on('unhandledRejection', (error) => {
      this.httpRequestLogger.error(error);
    });

    this.httpRequestLogger.log({
      timestamp: new Date(Date.now()).toISOString(),
      type: 'REQUEST',
      apiPath: req.originalUrl,
      requestHeaders: req.headers,
      requestMethod: req.method,
      requestBody: req.body,
      requestParams: req.params,
    });

    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];
    res.write = function (chunk: any, ...args: any[]) {
      chunks.push(chunk);
      return oldWrite.apply(res, [chunk, ...args]);
    };
    res.end = function (chunk: any, ...args: any[]) {
      if (chunk) {
        chunks.push(chunk);
      }
      return oldEnd.apply(res, [chunk, ...args]);
    };

    res.on('finish', () => {
      const responseBody = Buffer.concat(chunks).toString('utf8');

      this.httpResponseLogger.log({
        timestamp: new Date(Date.now()).toISOString(),
        type: 'RESPONSE',
        responseHeaders: res.getHeaders(),
        data: responseBody,
      });
    });

    next();
  }
}
