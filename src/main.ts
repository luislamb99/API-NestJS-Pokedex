import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";

async function start() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Validación de parametros (opcionales y que solo se acepten los correctos y no adicionales)
      forbidNonWhitelisted: true,
      transform: true, // Volver int los  query params
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  await app.listen(3000);
}
start();
