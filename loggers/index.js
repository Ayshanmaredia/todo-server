const { createLogger, format, transports } = require('winston');

// function getCurrentDate() {
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     let mm = today.getMonth() + 1;
//     let dd = today.getDate();

//     const currentDate =  dd + '-' + mm + '-' + yyyy;
//     return currentDate;
// }

const logger = createLogger({
    transports: [
        new transports.File({
            filename: `logs/error.log`,
            level: 'error',
            format: format.combine(format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), format.json())
        })
    ]
})

module.exports = logger;