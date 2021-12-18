import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { ConfigService } from './config.service';
import { Server } from 'socket.io';

@Injectable()
export class BinanceClient {
    private _baseEndpoint: string;
    private _streamName: string;
    private _ws: WebSocket;
    private _eventHandlers = new Map();

    constructor(readonly config: ConfigService) {
        this._baseEndpoint = config.env.BINANCE_WSS_ENDPOINT || 'wss://stream.binance.com/';
        this._streamName = config.env.ORDER_BOOK_STREAM_NAME;
        this.initializeConnection();
    }
    onModuleDestroy()
    {
        if(this._ws) {
            this._ws.close()
        }
    }
    private initializeConnection() {
        console.log("Initializing binance websocket connection");
        console.log(`${this._baseEndpoint}${this._streamName}`)
        this._ws = new WebSocket(`${this._baseEndpoint}${this._streamName}`);

        this._ws.onopen = () => {
            console.log("connected");
        };

        this._ws.on('pong', () => {
            console.log('pong from server');
        });
        
        this._ws.on('ping', () => {
            console.log('ping from server');
            this._ws.pong();
        });

        this._ws.onclose = () => {
            console.log('closed');
            setTimeout(() => {
                this.initializeConnection()
            }, 20000)
        };

        this._ws.onerror = (err) => {
            console.log('error', err);
            this._ws.close();
        };

        this._ws.onmessage = (msg: any) => {
            //console.log("message", msg);
            try {
                const message = JSON.parse(msg.data);
                const eventType = message.stream || message.e;
                if (eventType && this._eventHandlers.has(eventType)) {
                    this._eventHandlers.get(eventType).forEach(callback => callback(message));
                } else {
                    this._eventHandlers.get("default").forEach(cb => cb(message));
                }
            } catch (ex) {
                console.log('Invalid message', ex);
            }
        };

        this.heartBeat();
    }

    private heartBeat() {
        setInterval(() => {
            if (this._ws.readyState === WebSocket.OPEN) {
                this._ws.ping();
            }
        }, 20000);
    }

    subscribeToStream(id: number, params : any[])
    {
        this._ws.send(JSON.stringify({
            method: "SUBSCRIBE",
            params: params,
            id: id
        }), res => {
            console.log(res)
        })
    }

    unsubscribeToStream(id: number, params : any[])
    {
        this._ws.send(JSON.stringify({
            method: "UNSUBSCRIBE",
            params: params,
            id: id
        }), res => {
            console.log(res)
        })
    }
    setHandler(eventName: string, callback: Function) {
        if (!this._eventHandlers.has(eventName)) {
            this._eventHandlers.set(eventName, []);
        }
        this._eventHandlers.get(eventName).push(callback);
    }
}