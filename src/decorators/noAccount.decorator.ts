import { SetMetadata } from '@nestjs/common';

export const NO_ACCOUNT_KEY = 'NO_ACCOUNT';
export const NoAccout = () => SetMetadata(NO_ACCOUNT_KEY, true);
