import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    const options = new DocumentBuilder()
        .setTitle('nest prisma test api')
        .setDescription('nest prisma test api 文档')
        .setVersion('1.0')
        .build();
    //设置文档
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);
    await app.listen(4000);
}
bootstrap();
