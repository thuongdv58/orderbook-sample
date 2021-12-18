import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BinanceClient } from './binance_client';
import { BittrexClient } from './bittrex_client';
import { ConfigService } from './config.service';
import { OrderBookSimulator } from './orderbook.silulator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //const bittexClient = await app.get(BittrexClient);
  //await bittexClient.connect();
  //const binanceClient = await app.get(BinanceClient);
  //binanceClient.setHandler("depthUpdate", (message) => console.log(message));
  const orderBook = await app.get(OrderBookSimulator);
  //orderBook.bestPrice()
  const port = app.get(ConfigService).env.PORT || 3000

  await app.listen(port);
}
bootstrap();
