var db			= require('./db');
	passport	= require('passport');


module.exports = function(app, express){	
	app.post('/login', function(req, res) {
		console.log(req.body)
		//user = req.username;
  //   	if (req.session.logged) res.send('Welcome back!');
		// else {
	 //        req.session.logged = true;
	 //        res.send('Welcome!');
  //   	}
	});
}