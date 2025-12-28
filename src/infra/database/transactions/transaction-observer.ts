import { Logger } from '@nestjs/common';
import { getNamespace } from 'cls-hooked';
import { firstValueFrom, from, throwError } from 'rxjs';
import { Transaction } from 'sequelize';
import { CustomError } from 'src/utils/custom-error';
import { getSequelizeDatasource } from '../database.provider';

const logger = new Logger('TransactionObserver');

export interface TransactionEitherOptions {
  propagation: TransactionEitherPropagation;
}

export type TransactionEitherPropagation =
  | 'REQUIRED'
  | 'REQUIRES_NEW'
  | 'MANDATORY';

export const TransactionObserver = (
  options: TransactionEitherOptions = { propagation: 'REQUIRED' },
) => {
  return (_: any, __: any, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as (...args: any[]) => any;
    descriptor.value = function (...args: any[]) {
      if (
        process.env.NODE_ENV === 'test' ||
        process.env.JEST_WORKER_ID !== undefined
      ) {
        return from(Promise.resolve(originalMethod.apply(this, args)));
      }
      const namespace = getNamespace('sequelize-transaction-namespace');
      if (!namespace) {
        return throwError(() => new CustomError('Namespace not found'));
      }
      const currentTransaction: Transaction = namespace.get(
        'transaction',
      ) as Transaction;
      if (!currentTransaction && options.propagation === 'MANDATORY') {
        return throwError(
          () => new CustomError('Mandatory transaction required'),
        );
      }
      if (currentTransaction && options.propagation != 'REQUIRES_NEW') {
        return from(Promise.resolve(originalMethod.apply(this, args)));
      }

      const result = new Promise((resolve, reject) => {
        getSequelizeDatasource()
          .transaction(async () => {
            try {
              const originalResult = await firstValueFrom(
                originalMethod.apply(this, args) as Parameters<
                  typeof firstValueFrom
                >[0],
              );
              resolve(originalResult);
            } catch (err) {
              logger.debug(err);
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          })
          .catch((err) => {
            reject(err instanceof Error ? err : new Error(String(err)));
          });
      });

      return from(result);
    };
  };
};
