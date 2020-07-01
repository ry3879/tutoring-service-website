//ensureAuthenticated: makes sure that you are logged in if viewing a page that
//requires user info. If not, redirects to login page
//forwardAuthenticated: if you are on login/signup page, but you are already logged in,
//no need to create an account or log in. Therefore, redirects to home if neccessary.

module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/home');
    }
};