import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { PlannerModule } from './planner/planner.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

@Module({
	imports: [PrismaModule, ChatModule, PlannerModule],
	controllers: [HealthController],
})
export class AppModule { }
