import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Server-Sent Events (SSE) Controller
 *
 * Provides HTTP-based streaming for clients that cannot use WebSockets.
 * Supports policy events, transaction updates, and block notifications.
 */
@ApiTags('Streaming')
@Controller('stream')
export class StreamingController {
  private readonly logger = new Logger(StreamingController.name);
  private readonly clients = new Map<string, Response>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Listen for policy check events
    this.eventEmitter.on('policy.check', (payload: any) => {
      this.broadcastToClients('policy.check', payload);
    });
  }

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Subscribe to real-time events via Server-Sent Events (SSE)',
    description:
      'Streams policy checks, transactions, and other events. Use EventSource API on client.',
  })
  @ApiQuery({
    name: 'types',
    required: false,
    description: 'Comma-separated event types: policy,transaction,block',
    example: 'policy,transaction',
  })
  async streamEvents(
    @Request() req: any,
    @Res() res: Response,
    @Query('types') types?: string,
  ) {
    const userId = req.user.id;
    const clientId = `${userId}_${Date.now()}`;
    const eventTypes = types ? types.split(',') : ['policy'];

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Store client connection
    this.clients.set(clientId, res);

    this.logger.log(`SSE client connected: ${clientId} (user: ${userId})`);

    // Send initial connection message
    res.write(
      `data: ${JSON.stringify({ type: 'connected', clientId, eventTypes })}\n\n`,
    );

    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(clientId);
      this.logger.log(`SSE client disconnected: ${clientId}`);
      res.end();
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      if (!this.clients.has(clientId)) {
        clearInterval(heartbeat);
        return;
      }
      try {
        res.write(`: heartbeat\n\n`);
      } catch (error) {
        this.clients.delete(clientId);
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
    });
  }

  /**
   * Broadcast event to all connected SSE clients
   */
  private broadcastToClients(eventType: string, payload: any) {
    const message = `data: ${JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() })}\n\n`;

    for (const [clientId, res] of this.clients.entries()) {
      try {
        res.write(message);
      } catch (error) {
        this.logger.warn(
          `Failed to send to SSE client ${clientId}: ${error.message}`,
        );
        this.clients.delete(clientId);
      }
    }
  }
}
