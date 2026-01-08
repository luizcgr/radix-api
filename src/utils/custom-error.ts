import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, OperatorFunction, throwError } from 'rxjs';
import { BaseError } from 'sequelize';

export class CustomError extends Error {
  constructor(
    message: string,
    public readonly code: number = 400,
  ) {
    super(message);
  }
}

export const catchSequelizeError = <T>(
  message: string,
  logger: Logger,
): OperatorFunction<T, T> => {
  return catchError((error: BaseError) => {
    logger.error(error, error.stack);
    return throwError(() => new CustomError(message, 500));
  });
};

export const throwHttpError = (error: AxiosError) => {
  const responseData = error.response?.data as
    | { message?: string | string[] }
    | undefined;
  const msg =
    Array.isArray(responseData?.message) && responseData.message.length > 0
      ? responseData.message[0]
      : typeof responseData?.message === 'string'
        ? responseData.message
        : undefined;
  return throwError(
    () =>
      new CustomError(
        msg ?? 'Serviço indisponível',
        error.response?.status ?? 503,
      ),
  );
};

export const catchHttpErrorResponse = <T>(): OperatorFunction<T, T> => {
  return catchError((err: AxiosError) => {
    console.error(err);
    return throwHttpError(err);
  });
};
