import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCuidConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return typeof value === 'string' && /^c[a-z0-9]{24}$/.test(value);
  }

  defaultMessage(): string {
    return 'Invalid CUID format';
  }
}

export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsCuidConstraint,
    });
  };
}
