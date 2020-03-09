var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidation = require('express-validator');
var flash = require('connect-flash');
var firebase = require('firebase');

var config = {
    apiKey: "*",
    authDomain: "lobalam-f8d76.firebaseapp.com",
    databaseURL: "https://lobalam-f8d76.firebaseio.com",
    storageBucket: "lobalam-f8d76.appspot.com",
    messagingSenderId: "490580391053"
  };
  firebase.initializeApp(config);
 var fbRef = firebase.database().ref();

// route files
var routes = require('./routes/index');
var albumz = require('./routes/albumz');
var genres = require('./routes/genres');
var users = require('./routes/users');

//init App
var app = express();

//View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

// Logger
app.use(logger('dev'));

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Handle Sessions
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//Validator

app.use(expressValidation({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}

}));

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Connect Flash
app.use(flash());

//Global Vars
app.use(function(req,res,next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.authdata = firebase.auth().currentUser;
	res.locals.page = req.url;
	next();
	
	

});

app.get('*', function(req, res, next){
	if(firebase.auth().currentUser != null){
	var userRef = fbRef.child('users');

	userRef.once('value', function(snapshot){
		var user = [];

		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
				user.push({
					first_name: childData.first_name,
					last_name: childData.last_name,
					uid: childData.uid
				});
				res.locals.users = user;
				console.log(res.locals.users);
		});
	});
	}
	next();
});


// Get User Info
// app.get('*', function(req,res,next){
// 	if(firebase.auth().currentUser != null){
// 		var userRef = firebase.database().ref('users');
// 		res.locals.user = snapshot.val();
// 	};
// });

// Routes
app.use('/', routes);
app.use('/albumz', albumz);
app.use('/genres', genres);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

//Run Server
app.listen(app.get('port'), function(){
	console.log('Server started on port: '+ app.get('port'));
});