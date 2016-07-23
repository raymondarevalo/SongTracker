/* Creator: Raymond Arevalo
 * About project: This project tracks the songs played by the user. It's
 * meant to bring a simple tracker that will allow the user to know if
 * he or she has played the song.
 * 
 */

/* --------------------- GLOBAL VARIABLS ------------------------ */
var currentUser = null;		/* Our current user */
var wholeString = null;		/* Our current string to our directory */
var toPlaylist = null;		/* String to the recent played songs directory */
var currentPlaylist = {};	/* Contains our current past playlist */



/* ----------------------- SIGN IN/OUT : START ------------------------- */
/* Global sign in button */
var signInButton = document.createElement("BUTTON");

/* Global sign out button */
var signOutButton = document.createElement("BUTTON");

/* Sets the buttons' IDs */
signInButton.setAttribute("id", "signInButton");
signOutButton.setAttribute("id", "signOutButton");

/* Sets the buttons' type */
signInButton.setAttribute("type", "button");
signOutButton.setAttribute("type", "button");

/* Setting the function for each given function */
signInButton.setAttribute("onClick", "signIn()");
signOutButton.setAttribute("onClick", "signOut()");



/* Signs the user in or out */
function inOut() {

	/* Checks if there is a current user */
	var user = firebase.auth().currentUser; 

	/* If there is a user, then sign in */
	if (user == null) {
		/* Sign in */
		document.getElementById("sCol").appendChild(signInButton);
		document.getElementById("signInButton").innerHTML = "Sign In";
		console.log("User: " + firebase.auth().currentUser);
	}
	/* If there is no user, then sign out */
	else {
		document.getElementById("signInButton").remove();
		document.getElementById("sCol").appendChild(signOutButton);
		document.getElementById("signOutButton").innerHTML = "Sign Out";
		/* signOut */
	}
}



/* Signs the user in */
function signIn() {
	
		  	/* Google sign in */
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function(result) {
			  // This gives you a Google Access Token. You can use it to access the Google API.
			  var token = result.credential.accessToken;
			  // The signed-in user info.
			  var user = result.user;
			  /* Sets our current user */
			  setUser(user.uid);
			  inOut();
			  getPastPlaylist();
			  topArtists();


			  /* CHANGE THE BODY OF THE PAGE TO LOAD THE SONG FORM */
			  loadSongTracker();

			  // ...
			}).catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  // The email of the user's account used.
			  var email = error.email;
			  // The firebase.auth.AuthCredential type that was used.
			  var credential = error.credential;
			  // ...
			});
	
}

/* Signs the user out */
function signOut() {
	firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	  document.getElementById("signOutButton").remove();
	  inOut();
	  
	  removeSongTracker();
	}, function(error) {

	  // An error happened.
	});
}


/* Sets the strings for our artist directory and past playlist directory */
function setUser(user) {
	wholeString = 'users/' + user + '/music/songTracker/Artist/';
	toPlaylist = 'users/' + user + '/music/pastPlaylist/';
	
}

/* Loads the SongTracker once the user signs in */
function loadSongTracker() {
	document.getElementById('mainBody').style.display = 'block';
	document.getElementById('previousTop').style.display = 'block';
}

/* Unloads the SongTracker once the user signs out */
function removeSongTracker() {
	document.getElementById('mainBody').style.display = 'none';
	document.getElementById('previousTop').style.display = 'none';
}

/* ----------------------- SIGN IN/OUT : END ------------------------- */


/* Creates success alert if the song is saved */
function loadSuccess() {
	document.getElementById('successfulAlert').innerHTML = "<div class='alert alert-success fade in'> <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>Success!</strong> The song was tracked.</div>";
}

/* Creates a failure alert if the song is not saved */
function loadFailure() {
	document.getElementById('successfulAlert').innerHTML = "<div class='alert alert-danger fade in'> <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>Failure!</strong> The song wasn't tracked.</div>";
}




/* Reads in the input and converts it to readable form */	
function separateNames() {
    var x = document.getElementById("submitSong");
    var text = "";
    var i;
    for (i = 0; i < x.length ;i++) {
    	var str = x.elements[i].value.replace(/\s+/g, '-').toLowerCase();

        text += str + "<br>";
    }

    var song = document.getElementById("submitSong").elements[0].value.replace(/\s+/g, '-').toLowerCase();
    var artist = document.getElementById("submitSong").elements[1].value.replace(/\s+/g, '-').toLowerCase();

    addTrack(song, artist);
}


/* Adds the track onto the songTracker */
function addTrack(song, artist) {

	firebase.database().ref(wholeString + artist).once('value').then(function(snapshot) {
		
		/* If ther artist is not there, then create a new artist and addsong */
		if(snapshot.val() === null) {
			createArtist(artist);
			addSong(song, artist);
			insertSongInPlaylist(song, artist);
			// update playlist
					}
		/* If the artist is there, then check the song */
		else {
			checkSong(song, artist);
		}
	});


}

/* Creates a subfolder for the given artist */
function createArtist(artist) {

	firebase.database().ref(wholeString + artist).set({
		count: 0
	});	
}


/* Checks if the song has been played.  */
function checkSong(song, artist) {

	firebase.database().ref(wholeString + artist + '/' + song).once('value').then(function(snapshot) {

		/* Add the song if the song hasn't been played */
		if(snapshot.val() === null) {
			addSong(song, artist);
			// update playlist
			insertSongInPlaylist(song, artist);
		}
		/* If you've played the song before, warn the user and ask if he/she wants to play it again */
		else {
			/* create modal */

			var answer = confirm("You've played this track before. Would you like to play it again?");
			if(answer) {
				updateSong(song, artist);
				updateArtistCount(artist);

				insertSongInPlaylist(song, artist);
				loadSuccess();
			}
			else { loadFailure(); }	
		}
	});

}

/* Adds the song onto the songTracker */
function addSong(song, artist) {
	firebase.database().ref(wholeString + artist + '/' + song).set({
		count: 1
	});
	/* update count */
	updateArtistCount(artist);

	loadSuccess();
}

/* Updates the song's count */
function updateSong(song, artist) {

	/* Updates the amount of times the song has been played */
	var adaRankRef = firebase.database().ref(wholeString + artist + '/' + song + '/count');
		adaRankRef.transaction(function(currentRank) {
  		// If users/ada/rank has never been set, currentRank will be `null`.
  		return currentRank + 1;
	});
}

/* Updates the artist's count */
function updateArtistCount(artist) {
	var currentArtist = firebase.database().ref(wholeString + artist + '/count');
	currentArtist.transaction(function(currentCount) {
		return currentCount + 1;
	});
}


/* Gets our previous playlist */
function getPastPlaylist() {

firebase.database().ref(toPlaylist).once("value").then(function(snapshot) {
	var amountOfChildren = snapshot.numChildren();
	var i = amountOfChildren; 
	var y = 0;

	while( (0<i) && ( (amountOfChildren-5) < i ) ) {
		

		firebase.database().ref(toPlaylist + i).once("value").then(function(snapshot) {
			currentPlaylist[y] = snapshot.val();


			var newDiv = document.createElement("h3");
			var idName = "h" + y;
			newDiv.setAttribute("id", idName);
			document.getElementById("songBody").appendChild(newDiv);

			document.getElementById(idName).innerHTML = snapshot.val();
			++y;
		});

		--i;
	}

	
});


}



/* Inserts song into the previous playlist tracker */
function insertSongInPlaylist(song, artist) {

	firebase.database().ref(toPlaylist).once("value").then(function(snapshot) {
		var updates = {};
		var currentIndex = snapshot.numChildren()+1
		var line = song + " . " + artist + ". " + currentDateTime();
		updates[toPlaylist + currentIndex] = line;

		updateCurrentPlaylist(line);
		return firebase.database().ref().update(updates);

	});
	/* Artist - song - date - time */
	/* Insert song into pastPlaylist */
}





/* Updates the current playlist on the 
 * page with the song just inserted 
 */
function updateCurrentPlaylist(line) {
	var newDiv = document.createElement("h3");
	newDiv.innerHTML = line;
	var container = document.getElementById("songBody");
	container.insertBefore(newDiv, container.firstChild);

}

/* Returns current date and time */
function currentDateTime() {

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	var hrs = today.getHours();
	var mins = today.getMinutes();
	var secs = today.getSeconds();

	return mm + "-" + dd + "-" + yyyy + " . " + hrs + ":" + mins + ":" + secs;
}


/* Function that retrieves top 5 most played artists by the user */
/* Gets artists - amount the artist has been played - last played */
function topArtists() {
	/* Contains our most played artists */
	var topArtistsArr = [];
	var ref = firebase.database().ref(wholeString);
	ref.once("value", function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var pair = [childSnapshot.val()["count"], childSnapshot.key];
			topArtistsArr.push(pair);
		});
		

		topArtistsArr.sort(function(a, b){
			return b[0] - a[0];
		});

		/* At this point we have the top artist in order */

		topArtistsArr.slice(0,5).forEach(function(body) {


			var newDiv = document.createElement("h3");
			var idName = "ID" + body[1];
			newDiv.setAttribute("id", idName);
			document.getElementById("topBody").appendChild(newDiv);

			document.getElementById(idName).innerHTML = "Plays " + body[0] + " Artist:   \t " + body[1];
		});

	});
	
}

