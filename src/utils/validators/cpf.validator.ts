import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    if (!/^\d{11}$/.test(value)) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(value)) {
      return false;
    }

    const digits = value.split('').map((digit) => Number(digit));

    const firstVerifier = this.calculateVerifierDigit(digits.slice(0, 9), 10);
    if (firstVerifier !== digits[9]) {
      return false;
    }

    const secondVerifier = this.calculateVerifierDigit(digits.slice(0, 10), 11);
    return secondVerifier === digits[10];
  }

  defaultMessage(): string {
    return 'O CPF deve conter 11 dígitos numéricos e ser válido';
  }

  private calculateVerifierDigit(
    digits: number[],
    initialWeight: number,
  ): number {
    const sum = digits.reduce(
      (accumulator, digit, index) =>
        accumulator + digit * (initialWeight - index),
      0,
    );

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }
}

export function IsCpf(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: IsCpfConstraint,
    });
  };
}
