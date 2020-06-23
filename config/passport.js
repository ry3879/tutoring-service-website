const LocalStrategy = require('passport-local').Strategy;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;
const bcrypt = require('bcryptjs');
const connection = require('./connection');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        var login = new Request(`SELECT username, password FROM dbo.account_details_table
        WHERE username = @username`, 
        function(err,results, fields) {  
          if (err) {  
             console.log(err);
          }
        });
        login.addParameter('username', TYPES.VarChar, username);
        login.on('doneInProc', function(rowCount, more, rows) {
            if(rowCount == 1){
                bcrypt.compare(password, rows[0][1].value, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, {username:username});
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            }
            else{
                return done(null, false, {message: "Your username was incorrect"});
            }
        });
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
