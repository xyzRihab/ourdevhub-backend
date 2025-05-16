/* eslint-disable */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Record<string, Socket[]> = {};

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'supersecret',
      });

      const userId = payload.userId;
      client.data.userId = userId;

      if (!this.clients[userId]) this.clients[userId] = [];
      this.clients[userId].push(client);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (!userId) return;

    this.clients[userId] =
      this.clients[userId]?.filter((c) => c.id !== client.id) || [];
  }

  sendToUser(userId: string, notification: any) {
    const sockets = this.clients[userId];
    if (!sockets) return;

    sockets.forEach((socket) => {
      socket.emit('new-notification', notification);
    });
  }
}
