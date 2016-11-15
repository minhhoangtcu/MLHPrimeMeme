var request = require('request');

function getNorrisJoke(){
	return new Promise((resolve, reject) => {
		request('http://api.icndb.com/jokes/random?firstName=Jibo&amp;lastName=Doe', function (error, response, body) {
			if (!error && response.statusCode == 200) 
				resolve(JSON.parse(body).value.joke)
			else if(error)
				reject(error)
		})
	})
}

function getYoMama(){
	return new Promise((resolve, reject) => {
		request('http://api.yomomma.info/', function (error, response, body) {
			if (!error && response.statusCode == 200) 
				resolve(JSON.parse(body).joke)
			else if(error)
				reject(error)
		})
	})
}

function getJoke(){
	m = Math.random()
	if(m > 0.75)
		return getNorrisJoke()
	else
		return getYoMama()
}

// getJoke().then((data) => console.log(data))

exports.getJoke = getJoke;