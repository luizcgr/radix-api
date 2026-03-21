import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const [fields] = args.constraints as [string[]];
    const dto = args.object as Record<string, unknown>;

    return fields.some((field) => {
      const value = dto[field];

      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return true;
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints as [string[]];

    return `Pelo menos um dos campos deve ser informado: ${fields.join(' ou ')}`;
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return (target) => {
    const propertyName = '__atLeastOneFieldValidation__';

    if (!Object.prototype.hasOwnProperty.call(target.prototype, propertyName)) {
      Object.defineProperty(target.prototype, propertyName, {
        value: true,
        enumerable: false,
        writable: false,
      });
    }

    registerDecorator({
      target,
      propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
