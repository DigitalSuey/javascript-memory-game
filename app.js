// Global VARs
var firstFlip, lastFlip, firstElement, lastElement = undefined;
var counter = 0;
var startTime;
var timer;
// Define interval to run time function
var startGame = function interval() {
	timer = setInterval(time, 1000);
};
// Invoke SAPO's services
function getBadges() {
	// Request images for memory game
    request = new XMLHttpRequest();
	request.open('GET', 'https://services.sapo.pt/Codebits/listbadges ', true);

	request.onload = function() {
		if (this.status >= 200 && this.status < 400){
			// oui, c'est un Sucksaize !
			data = JSON.parse(this.response);
			var generatedNumber;
			var selectedBadges = [];
			// Loop to get 9 elements from the result
			for (var i = 0; i < 9; i++) {
				// Generate a random number between 0 and the length of the returned result
				generatedNumber = Math.floor((Math.random() * data.length-1) + 1);
				// Check if we're populating the random badge array's first index
				if (selectedBadges.length != 0) {
					// Check our existent properties, duplicates shall not pass
					for (var c = 0; c < selectedBadges.length; c++) {
						if ((data[generatedNumber].id == selectedBadges[c].id) && (c != i)) {
							// Found a duplicate value. Decrease i's value so we can overwrite the random badge array at index i
							i--;
							break;
						}else{
							// No duplicate found. Populate the random badges array at index i
							selectedBadges[i] = data[generatedNumber];
						}
					}
				}else{
					// Populate random badge array index 0
					selectedBadges[i] = data[generatedNumber];
				}
			}
			// Duplicate random badge array's content
			selectedBadges = selectedBadges.concat(selectedBadges);
			// Check if we had a previous games start button and remove it
			if (document.getElementById("startGameButton") != undefined) {
				document.getElementById("startGameButton").parentNode.removeChild(document.getElementById("startGameButton"));
				// Reset values for the next game
				document.getElementById("time").innerHTML = "";
				if (!document.getElementById("shareLink").classList.contains("invisible")) {
					document.getElementById("shareLink").className += ' invisible';
				}
				counter = 0;
				startTime = undefined;
				// Stop interval
				clearInterval(timer);
			}
			// Build the game board
			buildMatrix(selectedBadges);
		} else {
			// Oh non! c'est terrible! vi ritchéd le tarrgéte serrvou, bat retournez un error!
			console.log(this.response);
		}
	};

	request.onerror = function() {
		// Yeah, just some unknown connection error occured. No worries mate, no biggie!
		console.log("Connection error");
	};

	request.send();
}

function buildMatrix(badgesArray){
	// Suffle badges array with diplicate content
	var badgesArray = shuffle(badgesArray);

	var htmlString = "<table>";
	// Loop to build table rows and cells
	for (var i = 0; i < badgesArray.length; i++) {
		// Open up a new table row at the begining, one third and two thirds of the arrays length
		if (i == 0 || i == badgesArray.length/3 || i == (badgesArray.length/3)*2) {
			htmlString += "<tr>";
		}
		// Create cell markup
		htmlString += "<td onclick=\"flipElement("+i+", "+badgesArray[i].id+")\"><img id='img"+i+"' class='invisible' src='"+badgesArray[i].img+"' alt='"+badgesArray[i].title+"'></td>";
		// Close table row at one third, two thirds and at the end of the arrays length
		if (i == (badgesArray.length/3)-1 || i == ((badgesArray.length/3)*2)-1) {
			htmlString += "</tr>";
		}
	}
	htmlString += "</table>";
	// Insert table markup into HTML wrapper
	document.getElementById("matrixWrapper").innerHTML = htmlString;
	// Block game matrix
	document.getElementById("block").classList.remove("invisible");
	// Start game button markup
	var startButton = "<button id=\"startGameButton\">Iniciar Jogo</button>";
	// Inject new button to button wrapper
	document.getElementById("buttonWrapper").insertAdjacentHTML('afterend', startButton);
	// Add onClick event to unblock game and fire the timer
	document.getElementById("startGameButton").addEventListener("click", startGame, false);
}

function shuffle(array) {

    var randomNumber, randomObject;
    // Loop to go through all of the badge array's indexes
    for (var i = array.length - 1; i >= 0; i--) {
		// Generate a random number between 0 and all/remaining badge array's indexes
		randomNumber = Math.floor(Math.random() * i);
		// Save badge array's content at random number index to random object
		randomObject = array[randomNumber];
		// Swap array's content between index "i" and the random number index
		array[randomNumber] = array[i];
		array[i] = randomObject;
    }

    return(array);
}

function flipElement(elementId, imageId){
	// Check first and last flip global VARS value
	if (firstFlip == undefined) {
		firstFlip = imageId;
		firstElement = "img"+elementId;
		// Show badge
		document.getElementById(firstElement).classList.remove('invisible');
	}else if (firstFlip != undefined && lastFlip == undefined) {
		lastFlip = imageId;
		lastElement = "img"+elementId;
		// Check if user clicked on the same element twice
		if (firstElement != lastElement) {
			// Show badge
			document.getElementById(lastElement).classList.remove('invisible');
		}else{
			lastFlip = undefined;
			lastElement = undefined;
		}
	}
	// Compare first flipped badge with the second one
	if (firstFlip != undefined && lastFlip != undefined) {
		if (firstFlip == lastFlip) {
			// Same badges! Increment counter's value
			counter++;
			// Remove onClick event
			document.getElementById(firstElement).parentNode.removeAttribute('onClick');
			document.getElementById(lastElement).parentNode.removeAttribute('onClick');
			// Reset global VAR values
			firstFlip = undefined;
			lastFlip = undefined;
			firstElement = undefined;
			lastElement = undefined;
		}else{
			// Diferent badges! Wait half a second and hide them again
			setTimeout(function(){
				document.getElementById(firstElement).className += ' invisible';
				document.getElementById(lastElement).className += ' invisible';
				// Reset global VAR values
				firstFlip = undefined;
				lastFlip = undefined;
				firstElement = undefined;
				lastElement = undefined;
			},500);
		}
		// Check how many correct associations were made
		if (counter == 9) {
			// Finished the game! Stop timer and block the board
			stopGame();
			document.getElementById("block").className += ' invisible';
		}
	}
}

function time(){
	// Hide the blocker if the game started
	if (!document.getElementById("block").classList.contains("invisible")) {
		document.getElementById("block").className += ' invisible';
	}
	// Save the start time
	if (startTime == undefined) {
		startTime = new Date();
		// Reset the finish time
		finishTime = undefined;
	}
	// Get current time
    var currentTime = new Date();
    // Diference between start time and current time in miliseconds
    var timeDiff = currentTime - startTime;
    // Remove miliseconds
    timeDiff /= 1000;
    // Get seconds
    var seconds = Math.round(timeDiff % 60);
    // Remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);
    // Get minutes
    var minutes = Math.round(timeDiff % 60);
    // Remove minutes from the date
    timeDiff = Math.floor(timeDiff / 60);
    // Get hours
    var hours = Math.round(timeDiff % 24);
    // Remove hours from the date
    timeDiff = Math.floor(timeDiff / 24);
    // If the game has already finished only insert finished time
    if (counter == 9) {
		document.getElementById("time").innerHTML = finishTime;
	}else{
		document.getElementById("time").innerHTML = "Tempo: " + hours + ":" + minutes + ":" + seconds;
    }
}

function stopGame() {
	// Get finish time
	finishTime = document.getElementById("time").innerHTML;
	// Add the share link's href dynamicaly targeted to a new tab and show it
	document.getElementById("shareLink").setAttribute("href", "https://twitter.com/intent/tweet/?text=Memory JavaScript FTW em: "+finishTime.substring(7, finishTime.length)+".");
	document.getElementById("shareLink").setAttribute("target", "_blank");
	document.getElementById("shareLink").classList.remove("invisible");
}