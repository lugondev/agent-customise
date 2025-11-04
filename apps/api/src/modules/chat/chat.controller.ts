import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
	constructor(private readonly chat: ChatService) { }

	@Post()
	async chatOnce(@Body() body: { input: string; agentId?: string }): Promise<{ agentId: string; output: string }> {
		const res = await this.chat.chat(body.input, body.agentId);
		return res;
	}

	@Get('stream')
	async stream(@Query('input') input: string, @Query('agentId') agentId: string | undefined, @Res() res: Response) {
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		try {
			const result = await this.chat.chat(input, agentId);
			// naive chunked streaming of the single response
			const text = result.output;
			const chunks = text.match(/.{1,40}/g) || [text];
			for (const ch of chunks) {
				res.write(`data: ${ch}\n\n`);
			}
			res.write(`event: done\n`);
			res.write(`data: {"agentId":"${result.agentId}"}\n\n`);
			res.end();
		} catch (err: any) {
			res.write(`event: error\n`);
			res.write(`data: ${JSON.stringify({ message: err?.message || 'error' })}\n\n`);
			res.end();
		}
	}

	@Post('stream')
	async streamPost(@Body() body: { input: string; agentId?: string }, @Res() res: Response) {
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		try {
			// Send agent info first
			const result = await this.chat.chat(body.input, body.agentId);
			res.write(`data: ${JSON.stringify({ agentId: result.agentId })}\n\n`);

			// Stream output in small chunks for smooth effect
			const text = result.output;
			const chunkSize = 3;

			for (let i = 0; i < text.length; i += chunkSize) {
				const chunk = text.slice(i, i + chunkSize);
				res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
				await new Promise(resolve => setTimeout(resolve, 15));
			}

			res.write('data: [DONE]\n\n');
			res.end();
		} catch (err: any) {
			res.write(`data: ${JSON.stringify({ error: err?.message || 'error' })}\n\n`);
			res.end();
		}
	}
}
