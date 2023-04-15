import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('StackIntech JWT')
    .setDescription('"stackintech-jwt" is a NestJS open-source project available on GitHub that provides a simple and secure way to implement JSON Web Tokens (JWT) for authentication and authorization in your NestJS applications.')
    .setVersion('1.0')
    .addTag('JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
