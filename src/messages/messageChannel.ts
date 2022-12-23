import { config } from 'dotenv';
import { Channel , connect } from 'amqplib';

config();

export const createMessageChannel = async (): Promise<Channel> => {
    try{
        const connection = await connect(process.env.AMQP_SERVER);
        
        const channel = await connection.createChannel();
        
        await channel.assertExchange(
            process.env.EXCHANGE_NAME,
            'direct',
            {
                durable: true,
                autoDelete: false,
            }
        );

        await channel.assertQueue(process.env.QUEUE_NAME);
        
        await channel.bindQueue(
            process.env.QUEUE_NAME, 
            process.env.EXCHANGE_NAME, 
            process.env.ROUTING_KEY
        );

        console.log('Connected to RabbitMQ');

        return channel;
    } catch(error) {
        
        console.log('Error while trying to connect to RabbitMQ');
        
        console.log(error);
        
        return null;
    }

};

export const publishMessage = async (channel: Channel, exchange: string, routing_key: string, message: any): Promise<boolean> => {
    const messageJson = JSON.stringify(message);
    const sentToExchange = channel.publish(exchange, routing_key, Buffer.from(messageJson));
    
    return sentToExchange;
}