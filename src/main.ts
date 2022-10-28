import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('./secrets/rpc.saas3.io.key'),
    cert: readFileSync('./secrets/rpc.saas3.io_bundle.crt'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();

  const config = new DocumentBuilder()
  .setTitle('Web2 Wrapper')
  .setDescription('Wrappers for web2.0 API like Qatar2022 WorldCup API')
  .setVersion('0.1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  await app.listen(3301);
  console.log(`Composer is running on: ${await app.getUrl()}`);
}

bootstrap();
