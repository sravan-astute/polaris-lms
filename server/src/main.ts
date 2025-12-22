import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; // 👈 Import types

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so your frontend can talk to the backend
  app.enableCors();

  // 👇 DEBUG MIDDLEWARE (Now Type-Safe)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/questions') && req.method === 'POST') {
        console.log("------------------------------------------------");
        console.log("🕵️‍♂️ NETWORK DEBUGGER");
        console.log(`📨 Method: ${req.method} ${req.originalUrl}`);
        console.log(`🔑 Auth Header Received: '${req.headers.authorization}'`);
        console.log("------------------------------------------------");
    }
    next();
  });
  // 👆 END DEBUG MIDDLEWARE

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();