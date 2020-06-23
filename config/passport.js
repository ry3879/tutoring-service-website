const LocalStrategy = require('passport-local').Strategy;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;

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
        rowCollectionOnRequestCompletion: true
    }
};  
var connection = new Connection(config);  

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        var login = new Request(`SELECT username, password FROM dbo.account_details_table
        WHERE username = @username AND password = @password`, 
        function(err,results, fields) {  
          if (err) {  
             console.log(err);
          }
          else{
            //check if there is a result that accepted :)
            if(results==1){
              done(null, {username: username});
            }
            else{
              done(null, false, {message: "Your username or password was incorrect"});
            }
          }
         });
        login.addParameter('username', TYPES.VarChar, username);
        login.addParameter('password', TYPES.VarChar, password);     
        connection.execSql(login);
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });

  passport.deserializeUser(function(id, done) {
    done(null, {username:id});
  });
};
