const { createLogger,transports,format } = require('winston');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new transports.Console(),
        new transports.File({
            filename:'logfile.log',
            format:format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),format.simple()),
            colorize: true
        })
    ]
});
module.exports=logger