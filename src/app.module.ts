import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/config.schema';
import { typeOrmConfigAsync } from './config/typeorm.config';
import { SwaggerModule } from '@nestjs/swagger';
@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [config],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
