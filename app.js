var firstFlip, lastFlip, firstElement, lastElement = undefined;
var counter = 0;
// Invoke SAPO's services
function getBadges() {
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
			// Finished the game! Stop timer
		}
	}
}