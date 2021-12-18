import { Injectable } from '@nestjs/common'
import { BinanceClient } from './binance_client';
import { EventsGateway } from './events/events.gateway';

export interface IOrderBook {
    symbol,
    ask: number[][],
    bid: number[][],
    lastUpdateId: ''
}

@Injectable()
export class OrderBookSimulator {
    private data: IOrderBook;
    private readonly MAX_TOTAL_BIDDING_VALUE = 5; // total price * size
    private readonly MAX__TOTAL_ASKING_SIZE = 150;
    private readonly reverseOrderBook = true;
    private highestBuy: number;
    private lowestSell: number;
    private orderBookEmitters = new Map();

    constructor(private readonly binanceClient: BinanceClient, private readonly eventGateway: EventsGateway) {
        this.data = {
            symbol : "",
            ask : [],
            bid : [],
            lastUpdateId : ""
        }
        binanceClient.setHandler("default", (message) => { 
            if(message.bids && message.asks) {
                this.updateOrderBook(message.bids, message.asks)
            }
        });
    }

    getHighestBuy() {
        return this.highestBuy
    }

    getLowestSell() {
        return this.lowestSell
    }

    getOrderBook() {
        return this.data;
    }

    getSymbol() {
        return this.data.symbol;
    }

    getBestBid() {
        return this.data.bid[0][0];
    }

    getBestAsk() {
        return this.data.ask[0][0];
    }

    updateOrderBook(bid, ask) {
        if(this.reverseOrderBook) {
            this.highestBuy = 1 / bid[0][0];
            this.lowestSell = 1 / ask[0][0];
        } else {
            this.highestBuy = bid[0][0];
            this.lowestSell = ask[0][0];
        }
        const { bids, asks } = this.simulateOrderBook(this.highestBuy, this.lowestSell, this.MAX_TOTAL_BIDDING_VALUE, this.MAX__TOTAL_ASKING_SIZE)
        this.data.bid = bids;
        this.data.ask = asks;
        this.eventGateway.emitEvent(this.data)
    }

    simulateOrderBook(highestBuy: number, lowestSell: number, maxTotalBidding: number, maxTotalAskingSize: number) {
        var priceStep = highestBuy / 20;
        var sizeMax = maxTotalBidding / highestBuy / 20;
        
        var bids = []
        var totalBiddingValue = 0;
        var addedHighest = false;
        while(true)
        {
            var price = highestBuy - Math.random() * priceStep;
            if(!addedHighest) {
                price = highestBuy;
                addedHighest = true;
            }
            var size = Math.random() * sizeMax;
            totalBiddingValue += price * size;
            if(totalBiddingValue > maxTotalBidding) {
                break;
            }
            bids.push([price, size]);
        }
        bids.sort((a , b) => b[0] - a[0]);

        var asks = []
        var totalAskingSize = 0;
        var askingSizeMax = maxTotalAskingSize / bids.length * 2;
        var addedLowest = false;
        while(true) {
            var price = +lowestSell + Math.random() * priceStep;
            if(!addedLowest) {
                price = +lowestSell;
                addedLowest = true;
            }
            var size = Math.random() * askingSizeMax;
            totalAskingSize += size;
            if(totalAskingSize > maxTotalAskingSize) {
                break;
            }
            asks.push([price, size])
        }
        asks.sort((a, b) => a[0] - b[0]);
        return { bids, asks }
    }

    bestPrice() {
        setInterval(() => {
            if (this.data.ask.length == 0) {
                return;
            }
            console.log('Best Ask:', this.getBestAsk());
            console.log('Best Bid:', this.getBestBid());
        }, 1000);
    }

    addListener(name: string, callback: Function) {
        this.orderBookEmitters.set(name, callback);
    }
    
    removeListener(name) {
        this.orderBookEmitters.delete(name);
    }
}