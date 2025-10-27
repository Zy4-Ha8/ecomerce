import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManiger: EntityManager) {}
  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const { tableName, column } = validationArguments?.constraints[0];
    const exists = await this.entityManiger
      .getRepository(tableName)
      .createQueryBuilder()
      .where({ [column]: value })
      .getExists();

    return exists ? false : true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    const { column } = validationArguments?.constraints[0];
    return `the ${column} aleady exists`;
  }
}
