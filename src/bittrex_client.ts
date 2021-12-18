import { Injectable } from '@nestjs/common';
import * as signalR  from 'signalr-client';

@Injectable()
export class BittrexClient {
    private url = 'wss://socket-v3.bittrex.com/signalr';
    private hub = ['c3'];
    
    private apikey = '';
    private apisecret = '';
    
    private client;
    private resolveInvocationPromise: Function;
    
    constructor(){
    }
}
