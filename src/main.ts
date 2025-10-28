import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AllExceptionsFilter } from './filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Enable all log levels
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(helmet());

  app.use(morgan.default('combined'));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();
