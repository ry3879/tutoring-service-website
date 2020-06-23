var Connection = require('tedious').Connection;

//connect to the database
var config = {  
    server: 'tutoringservice.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: 'schladies', 
            password: 'nohotwater3@'  
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'EduDatabase',
        rowCollectionOnRequestCompletion: true,
        rowCollectionOnDone: true
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    // If no error, then good to proceed.
    console.log("Connected");  
});

module.exports = connection;