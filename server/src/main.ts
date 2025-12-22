import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. ✅ FIX: Explicit CORS Configuration
  app.enableCors({
    origin: [
      "http://localhost:3000",
      // 👇 YOUR LIVE FRONTEND URL (No trailing slash)
      "https://polaris-frontend-379760782242.us-east4.run.app"
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Debug Middleware (Kept from your code)
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

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 2. ✅ FIX: Use Cloud Run's PORT variable
  // Cloud Run injects 'PORT', usually 8080. If you ignore it, the app crashes.
  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();