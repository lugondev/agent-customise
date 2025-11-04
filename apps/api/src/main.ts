import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });

	// Apply global exception filter
	app.useGlobalFilters(new GlobalExceptionFilter());

	const port = process.env.PORT ? Number(process.env.PORT) : 3000;
	await app.listen(port);
	// eslint-disable-next-line no-console
	console.log(`API listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Fatal bootstrap error', err);
	process.exit(1);
});
