import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());

  // BAZOOKA FIX: Allow any origin for development
  app.enableCors({
    origin: true, // 👈 Auto-reflects the request origin
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Force Listen on IPv4 (Fixes Windows localhost issues)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();