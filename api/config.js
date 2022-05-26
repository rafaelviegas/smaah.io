global.SALT_KEY = process.env.SALT_KEY;

module.exports = {
    connectionString: process.env.DB_CONNECTION,
    amqpConnection: process.env.AMQP_CONNECTION,
    consumerQueue: process.env.QUEUE_MEASUREMENTS,
    exchange: process.env.EXCHANGE
};