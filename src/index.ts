import { config } from 'dotenv';
import axios from 'axios';
import Period from './enums/Period';
import Candle from './models/Candle';
import { createMessageChannel, publishMessage } from './messages/messageChannel';

config();

// Busca o preço da moeda em API
const readMarketPrice = async (): Promise<number> => {
    const result = await axios.get(process.env.PRICES_API);
    const data = result.data;
    const price = data.bitcoin.usd;
    console.log(price)
    return price;
}

//
const generateCandles = async () => {
    
    // Faz conecção com RabbitMQ
    const messageChannel = await createMessageChannel();

    if (messageChannel) {
        while (true) {
            // Conta quantidade de loops (pesquisa de 10 em 10 segundos)
            const loopTimes = Period.ONE_MINUTES / Period.TEN_SECONDS; 
    
            const candle = new Candle('BTC', new Date());
    
            console.log('Generanting new candle');
    
            for (let i = 0; i < loopTimes; i++) {
                const price = await readMarketPrice();
                candle.addValue(price);
                
                console.log(`Market price #${i + 1} of ${loopTimes}`);
    
                // Espera 10 segundos e realiza nova pesquisa
                await new Promise(r => setTimeout(r, Period.TEN_SECONDS)); 
            }
    
            candle.closeCandle();
            console.log('Candle close');
            
            const candleObj = candle.toSimpleObject();
            console.log(candleObj);

            const returnPublish = await publishMessage(messageChannel,process.env.EXCHANGE_NAME, process.env.ROUTING_KEY, candleObj)

            if(returnPublish) {
                console.log('Candle sent to queue');
            } else {
                console.log('Error - publishMessage')
            }
            
        }
    }

}

generateCandles();