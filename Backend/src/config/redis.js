const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    database: 2
});

client.connect()
    .then(() => console.log('Redis connected successfully!'))
    .catch(err => {throw(err)})

module.exports = client