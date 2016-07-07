
var signInButton = document.createElement("BUTTON");
var signOutButton = document.createElement("BUTTON");

signInButton.setAttribute("id", "signInButton");
signOutButton.setAttribute("id", "signOutButton");

signInButton.setAttribute("type", "button");
signOutButton.setAttribute("type", "button");

signInButton.setAttribute("onClick", "signIn()");

signOutButton.setAttribute("onClick", "signOut()");

/* Signs any account out once the page is loaded */

/*firebase.auth().signOut().then(function() {
}, function(error) {
}); */



function inOut() {

	console.log("Enters inOut");
	var user = firebase.auth().currentUser;
	console.log("User: " + user);
	if (user == null) {
		console.log("Sign in");
		/* Sign in */
		document.getElementById("sCol").appendChild(signInButton);
		document.getElementById("signInButton").innerHTML = "Sign In";
		console.log("User: " + firebase.auth().currentUser);
	}
	else {
		console.log("Sign out");

		document.getElementById("signInButton").remove();
		document.getElementById("sCol").appendChild(signOutButton);
		document.getElementById("signOutButton").innerHTML = "Sign Out";
		/* signOut */
	}
}









var currentUser = null;
var wholeString = null;

function signIn() {
	console.log("Enter login");
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
	console.log("Gets to the back");
}

function setUser(user) {
	wholeString = 'users/' + user + '/music/songTracker/Artist/';
	console.log("wholeString: " + wholeString);
}

function whoIsIn() {
	var user = firebase.auth().currentUser;

	var name, email, photoUrl, uid;

	if (user != null) {
	  name = user.displayName;
	  email = user.email;
	  photoUrl = user.photoURL;
	  uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
	                   // this value to authenticate with your backend server, if
	                   // you have one. Use User.getToken() instead.
	  console.log("DOES NOT ENTER " + user);
	}

	console.log("Name: " + name);
	console.log("Email: " + email);
	console.log("uid: " + uid);

}

function signOut() {
	firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	  document.getElementById("signOutButton").remove();
	  inOut();
	  console.log("Sign-out successful");
	  removeSongTracker();
	}, function(error) {
		console.log("An error happened");
	  // An error happened.
	});
}


function loadSongTracker() {
	document.getElementById('mainBody').style.display = 'block';
}

function removeSongTracker() {
	document.getElementById('mainBody').style.display = 'none';
}


function loadSuccess() {
	document.getElementById('successfulAlert').innerHTML = "<div class='alert alert-success fade in'> <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>Success!</strong> The song was tracked.</div>";
}

function loadFailure() {
	document.getElementById('successfulAlert').innerHTML = "<div class='alert alert-danger fade in'> <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>Failure!</strong> The song wasn't tracked.</div>";
}





function separateNames() {
	console.log("Enters seperate names");

    var x = document.getElementById("submitSong");
    var text = "";
    var i;
    for (i = 0; i < x.length ;i++) {
    	var str = x.elements[i].value.replace(/\s+/g, '-').toLowerCase();

        text += str + "<br>";
    }
    //document.getElementById("demo").innerHTML = text;

    /* document.getElementById().elements[0].value == the name of the song */
    /* document.getElementById().elements[1].value == the name of the artist */

    var song = document.getElementById("submitSong").elements[0].value.replace(/\s+/g, '-').toLowerCase();
    var artist = document.getElementById("submitSong").elements[1].value.replace(/\s+/g, '-').toLowerCase();
    console.log("Song: " + song + " artist: " + artist);

    addTrack(song, artist);
}


/* Adds the track onto the songTracker */
function addTrack(song, artist) {

	firebase.database().ref(wholeString + artist).once('value').then(function(snapshot) {
		
		/* If ther artist is not there, then create a new artist and addsong */
		if(snapshot.val() === null) {
			console.log("Artist is not there, and thus is new");
			createArtist(artist);
			addSong(song, artist);
					}
		/* If the artist is there, then check the song */
		else {
			console.log("Artist is already there, and thus is old");
			checkSong(song, artist);
		}
	});


}

/* Creates a subfolder for the given artist */
function createArtist(artist) {

	firebase.database().ref(wholeString + artist).set({
		count: "0"
	});	
}


/* Checks if the song has been played.  */
function checkSong(song, artist) {

	firebase.database().ref(wholeString + artist + '/' + song).once('value').then(function(snapshot) {

		/* Add the song if the song hasn't been played */
		if(snapshot.val() === null) {
			console.log("Song is not there");
			addSong(song, artist);
		}
		/* If you've played the song before, warn the user and ask if he/she wants to play it again */
		else {
			/* create modal */

			var answer = confirm("You've played this track before. Would you like to play it again?");
			if(answer) {
				updateSong(song, artist);
				loadSuccess();
			}
			else { loadFailure(); }	
		}
	});

}

/* Adds the song onto the songTracker */
function addSong(song, artist) {
	console.log("enters addSong()");
	firebase.database().ref(wholeString + artist + '/' + song).set({
		count: 1
	});
	loadSuccess();
}

/* Updates the song */
function updateSong(song, artist) {

	/* Updates the amount of times the song has been played */
	var adaRankRef = firebase.database().ref(wholeString + artist + '/' + song + '/count');
		adaRankRef.transaction(function(currentRank) {
  		// If users/ada/rank has never been set, currentRank will be `null`.
  		return currentRank + 1;
	});
}


function online() {

}