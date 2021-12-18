import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    emitEvent(orderBook: any) {
        this.server.emit("events", orderBook);
    }

    @SubscribeMessage('events')
    events(@MessageBody() data: any): Observable<WsResponse<any>> {
        return from([1, 2, 3]).pipe(
            map((item) => ({ event: 'events', data: item })),
        );
    }
}
