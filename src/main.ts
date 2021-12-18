import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BinanceClient } from './binance_client';
import { BittrexClient } from './bittrex_client';
import { OrderBookSimulator } from './orderbook.silulator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //const bittexClient = await app.get(BittrexClient);
  //await bittexClient.connect();
  //const binanceClient = await app.get(BinanceClient);
  //binanceClient.setHandler("depthUpdate", (message) => console.log(message));
  const orderBook = await app.get(OrderBookSimulator);
  //orderBook.bestPrice()
  await app.listen(443);
}
bootstrap();
