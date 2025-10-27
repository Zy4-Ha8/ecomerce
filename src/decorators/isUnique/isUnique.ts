import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsUniqueConstraint } from './isUniqueConstraint';

export type isUniqueConstraintInput = {
  tableName: string;
  column: string;
};
export function isUnique(
  options: isUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'is-unique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsUniqueConstraint,
    });
  };
}
