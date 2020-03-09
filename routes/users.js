var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var fbRef = firebase.database().ref();

router.get('/register', function(req, res, next){
	res.render('users/register');

});
router.get('/login', function(req, res, next){
	res.render('users/login');

});

router.post('/register', function(req, res, next){
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	

	//Validation
	req.checkBody('first_name','First name is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Passwords do not Match').equals(req.body.password);

	var errors = req.validationErrors();


	if(errors){
		res.render('users/login', {
			errors: errors
		});
		
	}else{
		firebase.auth().createUserWithEmailAndPassword(email, password)
		.then(function(userData){
				console.log("Successfully created user with uid", userData.uid);
				var user = {
					uid: userData.uid,
					email: email,
					first_name: first_name,
					last_name: last_name
				}
				var userRef = fbRef.child('users');
				userRef.push().set(user);
				req.flash('success_msg','You are now registered');
				res.redirect('/users/login');
			})
		.catch(function(err){
			if(error){
				console.log("Error creating user: " + error.code +' '+error.message);
				req.flash('error_msg','Registration Errors');
			}
		});
		
	}

});

router.post('/login', function(req, res, next){
	var email = req.body.email;
	var password = req.body.password;

	//Validation
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('password','Password is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('users/login', {
			errors: errors
		});
	}else{
		firebase.auth().signInWithEmailAndPassword(email, password)
		.then(function(authData){
				console.log("Successfully logged in", authData.email);

				req.flash('success_msg',authData.email +' is now logged in');
				res.redirect('/albumz');
			})
		.catch(function(err){
			if(err){
				console.log("Login Failed : " + err.code +' '+err.message);
				req.flash('error_msg','Login Failed');
				res.redirect('/users/login');
			}
		});
		
	}

});

router.get('/logout', function(req, res, next){
	firebase.auth().signOut();

	req.flash('success_msg','You have logged out');
	res.redirect('/users/login');

});

module.exports = router;