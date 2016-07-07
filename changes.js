
var signInButton = document.createElement("BUTTON");
var signOutButton = document.createElement("BUTTON");

signInButton.setAttribute("id", "signInButton");
signOutButton.setAttribute("id", "signOutButton");

signInButton.setAttribute("type", "button");
signOutButton.setAttribute("type", "button");

signInButton.onClick = signIn();
signOutButton.onClick = signOut();




inOut();


function inOut() {
	console.log("Enters inOut");
	var user = firebase.auth().currentUser;
	if (user === null) {
		console.log("Sign in");
		/* Sign in */
		document.getElementById("sCol").appendChild(signInButton);
		document.getElementById("signInButton").text = "HEL";
	}
	else {
		console.log("Sign out");
		document.getElementById("sCol").appendChild(signOutButton);
		/* signOut */
	}
}



