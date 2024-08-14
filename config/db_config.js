module.exports = {
  url: process.env.URL_BD || "mongodb://localhost:27017/fudem?authSource=admin",
  // url: process.env.URL_BD ||'mongodb://35.237.55.120:27017/viewmed',
  options: {
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 20, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    user: "root",
    pass: "123456",
    useNewUrlParser: true,
  },
};
