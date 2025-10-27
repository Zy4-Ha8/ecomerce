import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(helmet());
  app.use(morgan.default('combined'));
  app.use(mongoSanitize.default());
  app.use(xss.default());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();
