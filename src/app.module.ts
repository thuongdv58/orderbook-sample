import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceClient } from './binance_client';
import { BittrexClient } from './bittrex_client';
import { ConfigService } from './config.service';
import { EventsModule } from './events/events.module';
import { OrderBookSimulator } from './orderbook.silulator';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [
        AppService,
        {
            provide: ConfigService,
            useFactory: () => {
              if (process.env.NODE_ENV === 'production') return new ConfigService(".env.prod")
              return new ConfigService(".env")
            },
        },
        BittrexClient, 
        BinanceClient,
        OrderBookSimulator,
    ],
})
export class AppModule {}
