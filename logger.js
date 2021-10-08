const bunyan = require('bunyan')

exports.loggerInstance = bunyan.createLogger({
    name: 'Consultas',
    serializers: {
        req: require('bunyan-express-serializer'),
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
    },
    streams: [
        {
            type: 'rotating-file',
            level: 'info',
            path: './api.log',
            period: '1d',   // daily rotation
            count: 10        // keep 10 back copies
        },
        {
            type: 'rotating-file',
            level: 'error',
            path: './api-error.log',
            period: '1d',   // daily rotation
            count: 10       // keep 10 back copies
        },        
        {
            stream: process.stdout
        }
    ]
});

exports.logResponse = function (id, body, statusCode) {
    var log = this.loggerInstance.child({
        id: id,
        body: body,
        statusCode: statusCode
    }, true)
    log.info('response')
}