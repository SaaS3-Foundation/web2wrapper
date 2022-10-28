import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { ConfigModule } from '@nestjs/config';
import envConfig from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envConfig.path],
    }),
  ],
  controllers: [MainController],
  providers: [],
})
export class AppModule {}
