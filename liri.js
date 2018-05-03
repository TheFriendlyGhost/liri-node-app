require('dotenv').config()
var fs = require('fs')
var Twitter = require('twitter');
var keys = require('./keys.js')
var Spotify = require('node-spotify-api')
var request = require('request')

var spotify = new Spotify(keys.spotify)
var client = new Twitter(keys.twitter)

var args = process.argv.splice(2)

var action = args[0]

writeToFile(action)

if(action === 'my-tweets'){
	myTweets()
}else if(action === 'spotify-this-song'){
	var song = ''
	if(args.length > 1){
		for(var i = 1; i < args.length; i++){
			song = song + ' ' + args[i]
		}
		song = song.trim()
	}else{
		song = 'The Sign'
	}
	spotifyThisSong(song)
}else if(action === 'movie-this'){
	var movie = ''
	if(args.length > 1){
		for(var i = 1; i < args.length; i++){
			movie = movie + '+' + args[i]
		}
		movie = movie.trim()

		movie = movie.slice(1, movie.length)
	}else{
		movie = 'Mr.+Nobody'
	}
	// console.log(movie)
	movieThisMovie(movie)
}else if(action === 'do-what-it-says'){
	doAsISayNotAsIDo()
}

function spotifyThisSong(argSong){
	// console.log(argSong)
	spotify.search({ type: 'track', query: argSong, limit: 20}, function(err, data) {
	  	if (err) {
	    	return console.log('Error occurred: ' + err);
	  	}
	 	
	  	var items = data.tracks.items

	  	// console.log(items)
	  	var index = -1
		for(var i = 0; i <items.length; i++){
			// console.log(items[i].name.toLowerCase(), argSong.toLowerCase())
			if(items[i].name.toLowerCase() === argSong.toLowerCase()){
				index = i
				// console.log(index, items[i].name)
				break
			}
		}

		if(index >= 0){
			console.log(JSON.stringify(items[index].artists[0].name, null, 2))
			console.log(JSON.stringify(items[index].name, null, 2))
			
			if(items[index].preview_url === null){
				console.log('No preview available for this track, so here is a link to open it in Spotify!')
				console.log(JSON.stringify(items[index].external_urls.spotify, null, 2))
			}else{
				console.log(JSON.stringify(items[index].preview_url, null, 2))
			}
			
			console.log(JSON.stringify(items[index].album.name, null, 2))

			var toWrite = items[index].artists[0].name + " " + items[index].name + " " + items[index].preview_url + " " + items[index].album.name

			writeToFile(toWrite)
			writeToFile('------------------------------------------------')
		}else{
			console.log('The song could not be found')
		}
	})
}

function myTweets(){
	// console.log('here')
	client.get('statuses/user_timeline', { screen_name: 'FrankReynolds__' }, function(error, tweets, response) {
		var id
		var date
		var text
		// console.log(JSON.stringify(tweets,null,2))
		tweets.forEach(function(element){
			id = element.user.screen_name
			date = element.created_at
			text = element.text

			console.log(JSON.stringify(id,null,2))
	   		console.log(JSON.stringify(date,null,2))
	   		console.log(JSON.stringify(text,null,2), '\n')
	   		
	   		var toWrite = id + " " + date + " " + text
	   		writeToFile(toWrite)

		})
		writeToFile('------------------------------------------------')
	})
}

function movieThisMovie(argMovie){
	request("http://www.omdbapi.com/?t="+argMovie+"&y=&plot=short&apikey=trilogy", function(error, response, body) {
		if(error){
			console.log(error)
		}
	  	// If there were no errors and the response code was 200 (i.e. the request was successful)...
	  	if (!error && response.statusCode === 200) {
	    	console.log("The movie's title is: " + JSON.parse(body).Title);
	    	console.log("The movie was released in: " + JSON.parse(body).Year);
	    	console.log("The movie's IMDB rating is: " + JSON.parse(body).imdbRating);
	    	console.log("The movie's Rotten Tomatoes rating is: " + JSON.parse(body).Ratings[1].Value);
	    	console.log("The movie was produced in: " + JSON.parse(body).Country);
	    	console.log("The movie's is in: " + JSON.parse(body).Language);
	    	console.log("The movie's plot is: " + JSON.parse(body).Plot);
	    	console.log("The movie's Actors: " + JSON.parse(body).Actors);

	    	var toWrite = JSON.parse(body).Title + " " + JSON.parse(body).Year + " " + JSON.parse(body).imdbRating + " " + JSON.parse(body).Ratings[1].Value + " " + JSON.parse(body).Country + " " + JSON.parse(body).Language + " " + JSON.parse(body).Plot + " " +JSON.parse(body).Actors
			writeToFile(toWrite)
			writeToFile('------------------------------------------------')
	  	}else{
	  		console.log('The movie could not be found')
	  	}
	})
}

function doAsISayNotAsIDo(){
	fs.readFile('random.txt', 'utf8', function(error, data){
		if (error){
			return console.log(error)
		}

		var arr = data.split(',')
		
		var song = arr[1]
		song = arr[1].slice(1,song.length-1)

		spotifyThisSong(song)
	})
}

function writeToFile(argArr){
	fs.appendFile('log.txt', argArr + '\n', function(err) {
		if (err) {
			console.log(err);
		}
	})
}