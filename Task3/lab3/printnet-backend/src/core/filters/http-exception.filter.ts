import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      status: "error",
      timestamp: new Date().toISOString(),
      ...(typeof exceptionResponse === "object" && exceptionResponse !== null
        ? exceptionResponse
        : { message: exceptionResponse }),
    });
  }
}
