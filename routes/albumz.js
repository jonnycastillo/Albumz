var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var multer = require('multer');
var upload = multer({dest: './public/images/uploads'});
var fbRef = firebase.database().ref();

router.get('*', function(req, res, next){
	if(firebase.auth().currentUser == null){
		res.redirect('/users/login');
	}
	next();
})


router.get('/', function(req, res, next){
	var albumRef = fbRef.child('albumz');
	console.log(firebase.auth().currentUser.uid)

	albumRef.once('value', function(snapshot){
		var albumz = [];

		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			if(childData.uid == firebase.auth().currentUser.uid){
			
				albumz.push({
					id: key,
					artist: childData.artist,
					genre: childData.genre,
					title: childData.title,
					cover: childData.cover
				});
			}
		});
		
		res.render('albumz/index', {albumz: albumz})
	});

});


router.get('/add', function(req, res, next){
	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot){
		var data = [];

		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			
			data.push({
				id: key,
				name: childData.name
			});
		
		});
		res.render('albumz/add', {genres: data});
	});

});

router.post('/add', upload.single('cover'), function(req, res, next){
	//Check file upload
	if(req.file){
		console.log('Uploading File....');
		var cover = req.file.filename;
	}else {
		console.log('No File Uploaded...');
		var cover = 'noimage.jpg';
	}
	
	var album = {
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		cover: cover,
		uid: firebase.auth().currentUser.uid	
	}

	var albumRef = fbRef.child('albumz');
	albumRef.push().set(album);

	req.flash('success_msg','Album Saved');
	res.redirect('/albumz')


});

router.get('/details/:id', function(req, res){
	var id = req.params.id;
	var albumRef = firebase.database().ref('/albumz/'+id);

	albumRef.once('value', function(snapshot){

		var album = snapshot.val();
		res.render('albumz/details', {album: album, id: id});
	})


});

router.get('/edit/:id', function(req, res, next){
	var id = req.params.id;

	

	var albumRef = firebase.database().ref('/albumz/'+id);

	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot){
		var genres = [];

		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			genres.push({
				id: key,
				name: childData.name
			});
		});
		albumRef.once('value', function(snapshot){

		var album = snapshot.val();
		res.render('albumz/edit', {album: album, id: id, genres: genres})
	});
	});

	

});

router.post('/edit/:id', upload.single('cover'), function(req, res, next){
	var id = req.params.id;

	var albumRef = firebase.database().ref('/albumz/'+id);

	if(req.file){

	var cover = req.file.filename;

	albumRef.update({
				artist: req.body.artist,
				genre: req.body.genre,
				title: req.body.title,
				cover: cover
			});
	}else{
		albumRef.update({
				artist: req.body.artist,
				genre: req.body.genre,
				title: req.body.title
			});
	};
	req.flash('success_msg','Album Updated');
	res.redirect('/albumz/details/'+id);
});

router.delete('/delete/:id', function(req, res, next){
	var id = req.params.id;
	var albumRef = firebase.database().ref('/albumz/'+id);

	albumRef.remove();
	req.flash('success_msg', 'Album Deleted');
	res.sendStatus(200);

});
module.exports = router;