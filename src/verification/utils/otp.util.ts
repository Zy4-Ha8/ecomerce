import * as crypto from 'crypto';

export function generateOTP(size: number = 6) {
  const max = Math.pow(10, size);
  const randomNumber = crypto.randomInt(0, max);
  return randomNumber.toString().padStart(size, '0');
}
