import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security
  app.use(helmet());
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (frontendUrl !== 'http://localhost:3000' && !frontendUrl.startsWith('http')) {
    frontendUrl = `https://${frontendUrl}`;
  }

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
