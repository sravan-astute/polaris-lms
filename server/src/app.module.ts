import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuizzesModule } from './quizzes/quizzes.module';
// 👇 IMPORT THE NEW MODULE
import { QuestionsModule } from './questions/questions.module'; 

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    QuizzesModule, 
    QuestionsModule // 👈 REGISTER IT HERE
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}