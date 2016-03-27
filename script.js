// New Script //
var map;

var lastClicked = {
	name : '',
	address : '',
	content : '',
	location : '',
	//country : '',
	viewport : '',
	id : '',
	placeID : '',
	lat : '',
	lng : '',
	types : '',
	url : '',
	icon : '',
	marker : '',
}

function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map-div'), {
    center: {lat: 39.173303, lng: -77.177274},
    scrollwheel: true,
    zoom: 5
  });

	var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input')
	);

	var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map
  });

	google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
		lastClicked.marker = marker;
  });

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

		//console.log(place);

		lastClicked.name = place.name;
		lastClicked.address = place.formatted_address;
		lastClicked.location = place.geometry.location;
		lastClicked.viewport = place.geometry.viewport;
		lastClicked.id = place.id;
		lastClicked.placeID = place.place_id;
		lastClicked.lat = place.geometry.location.lat;
		lastClicked.lng = place.geometry.location.lng;
		lastClicked.types = place.types;
		lastClicked.url = place.url;
		lastClicked.icon = place.icon;
		lastClicked.marker = marker;

		$('#lo-name').text(lastClicked.name);
		$('#lo-address').text(lastClicked.address);
		$('#lo-link').attr("href", lastClicked.url);
		$('#s-img').attr("src", lastClicked.icon);

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

		marker.setPlace(/** @type {!google.maps.Place} */ ({
      placeId: place.place_id,
      location: place.geometry.location
    }));
    marker.setVisible(true);

    infowindow.setContent('<div class="infobox"><strong>' + place.name + '</strong><br>' +
        'Place ID: ' + place.place_id + '<br>' +
        place.formatted_address + '<br><br>' + '</div>');
    infowindow.open(map, marker);
  });

}

function gool(str) {
	//console.log(str);
}

// Button Functions
$(document).ready(function(){

	//var searchIcon = $('#search-icon');
	//var savedIcon = $('#saved-icon');
	//var markerIcon = $('#marker-icon');

	var refreshIcon = $('#refresh');

	//var searchDiv = $('#search-div');
	//var savedDiv = $('#saved-div');
	//var markerDiv = $('#marker-div');

	//var sh = true;
	//var sd= true;
	//var mk = true;

	/*searchIcon.click(function(){

		if(sh == true) {
			savedDiv.hide('fast');
			markerDiv.hide('fast');
			searchDiv.show('fast');
			sh = false;
			sd = true;
			mk = true;
		}
		else {
			savedDiv.hide('fast');
			searchDiv.hide('fast');
			markerDiv.hide('fast');
			sh = true;
			sd = true;
			mk = true;
		}

	});

	savedIcon.click(function(){

		if(sd == true) {
			searchDiv.hide('fast');
			markerDiv.hide('fast');
			savedDiv.show('fast');
			sh = true;
			mk = true;
			sd = false;
		}
		else {
			savedDiv.hide('fast');
			searchDiv.hide('fast');
			markerDiv.hide('fast');
			sh = true;
			mk = true;
			sd = true;
		}

	});

	markerIcon.click(function(){

		if(mk == true) {
			searchDiv.hide('fast');
			savedDiv.hide('fast');
			markerDiv.show('fast');
			mk = false;
			sh = true;
			sd = true;
		}
		else {
			savedDiv.hide('fast');
			searchDiv.hide('fast');
			markerDiv.hide('fast');
			sh = true;
			mk = true;
			sd = true;
		}

	});*/

	refreshIcon.click(function(){

		if( $('#saved-div').css('visibility') == 'visible' ||
				$('#search-div').css('visibility') == 'visible' ||
				$('#marker-div').css('visibility') == 'visible') {
			console.log("Just Refreshed.");
			return
		}

		map.setZoom(4);
	});

});

// Main Angular Application
var App = angular.module("myApp", ["firebase"]);

App.factory("travelr", ["$firebaseArray",
	function($firebaseArray) {

   	var ref = new Firebase("https://the-travelr.firebaseio.com/");

   	// this uses AngularFire to create the synchronized array
    return $firebaseArray(ref);
	}
]);

// Master Angular Controller
App.controller("masterCtrl", ["$scope", "travelr",
function($scope, travelr) {

	$scope.travels = travelr;
	$scope.travelr = $scope.travels;
	$scope.savedMarkers = [];

	setTimeout(function(){
		$scope.loadSaved();
	},3000);

	$scope.loadSaved = function(){

		if($scope.travels.length == 0) {
			return;
		}
		else {

			$.each($scope.travels, function(index, item){
				//console.log(item);
				var infowindow = new google.maps.InfoWindow();

				var geocode = "https://maps.googleapis.com/maps/api/geocode/json?address=" + item.location + "%20rd&key=AIzaSyCSHPWjouiZzdAI_EhWkuuLsFMEGTgyYWE";

				$.getJSON(geocode, function(data){

					//console.log(data);

					var infoBox = '<div class="infobox">' + '<center>' +
					'<h3>' + item.name + '</h3>' +
					'<img src="' + item.icon + '"/>' + '<br>' +
					'<p>' + item.location + '</p>' +
					'</center>' + '<div>';

					var marker = new google.maps.Marker({
						map: map,
						id: item.id,
						animation: google.maps.Animation.DROP,
						position: data.results[0].geometry.location
					});

					$scope.savedMarkers.push({
						marker: marker,
						content: infoBox
					});

					google.maps.event.addListener(marker, 'click', function() {
						infowindow.setContent(infoBox);
						map.setZoom(12);
						map.setCenter(marker.position);
						infowindow.open(map, marker);
						map.panBy(0, -125);
					});

					marker.setMap(map);

				});

			});

			$('#msg1').show('fast');
			setTimeout(function(){
				$('#msg1').hide('fast');
			},3000);

		}

	}

	$('#ac-btn').click(function(){
		alert("This");
	});

	$scope.addLocationOne = function() {

		if(lastClicked.location == '') {
			return;
		}

		var message;

		var ask = confirm("Do You Want To Add This Location to Your Saved List?");

		if(ask == false) {
			//console.log("False.");
			return;
		}

		var askTwo = confirm('Do You Want to Attach a Message?');

		if(askTwo == true) {
			var p = prompt("Enter Message:");
			if(p == '') {
				alert("You Entered an Empty Message. Operation Aborted.");
				return;
			}
			if(p != '') {
				alert("Message Attached!");
				message = p;
			}
		}

		if(askTwo == false) {
			message = '-- No Message Was Attached --';
		}

		for(var key in $scope.travels) {
			if(lastClicked.id === $scope.travels[key].id) {
				alert("The Location You Are Trying to Add is Already in the Saved List.");
				return;
			}
		}

		var date = Date();

		$scope.travels.$add({
			name : lastClicked.name,
			location : lastClicked.address,
			icon : lastClicked.icon,
			url : lastClicked.url,
			id : lastClicked.id,
			message : message,
			date : date,
		});

		//console.log("Admit One.");
		alert("Location Added To Saved!");

	}

	$scope.searchPlaces = function() {

		var query = $('#query').val();
		var city = $('#city').val();

		if(query == '' || city == '') {
			$('#message1').text('Please Fill In Both Fields.');
			setTimeout(function(){
				$('#message1').text('');
			},3000);
			return;
		}

		var geocode = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "%20rd&key=AIzaSyCSHPWjouiZzdAI_EhWkuuLsFMEGTgyYWE";
		var coordinates;
		var request;

		$scope.places = [];
		$scope.mapMarkers = [];

		$.getJSON(geocode,function(data){
			//console.log(data);
			coordinates = data.results[0].geometry.location;
			//console.log(coordinates);

			request = {
	    	location: coordinates,
	    	radius: '12685',
	    	types: query
	  	};
			//console.log(request);

			map = new google.maps.Map(document.getElementById('map-div'), {
    		center: coordinates,
    		zoom: 12,
    		scrollwheel: true
  		});

			$('#map-div').append('<input type="text" id="pac-input" placeholder="Enter a Location"/>');

			var input = /** @type {HTMLInputElement} */(
		      document.getElementById('pac-input')
			);

			autocomplete = new google.maps.places.Autocomplete(input);
		  autocomplete.bindTo('bounds', map);

			map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		  var infowindow = new google.maps.InfoWindow();
		  var marker = new google.maps.Marker({
		    map: map
		  });

			google.maps.event.addListener(marker, 'click', function() {
		    infowindow.open(map, marker);
				lastClicked.marker = marker;
		  });

			google.maps.event.addListener(autocomplete, 'place_changed', function() {
		    infowindow.close();
		    var place = autocomplete.getPlace();
		    if (!place.geometry) {
		      return;
		    }

				lastClicked.name = place.name;
				lastClicked.address = place.formatted_address;
				lastClicked.location = place.geometry.location;
				lastClicked.viewport = place.geometry.viewport;
				lastClicked.id = place.id;
				lastClicked.placeID = place.place_id;
				lastClicked.lat = place.geometry.location.lat;
				lastClicked.lng = place.geometry.location.lng;
				lastClicked.types = place.types;
				lastClicked.url = place.url;
				lastClicked.icon = place.icon;
				lastClicked.content = '<div class="infobox"><strong>' + place.name + '</strong><br>' +
		        'Place ID: ' + place.place_id + '<br>' +
		        place.formatted_address + '<br><br>' + '</div>';
				lastClicked.marker = marker;

				$('#lo-name').text(lastClicked.name);
				$('#lo-address').text(lastClicked.address);
				$('#lo-link').attr("href", lastClicked.url);
				$('#s-img').attr("src", lastClicked.icon);

		    if (place.geometry.viewport) {
		      map.fitBounds(place.geometry.viewport);
		    } else {
		      map.setCenter(place.geometry.location);
		      map.setZoom(17);
		    }

				marker.setPlace(/** @type {!google.maps.Place} */ ({
		      placeId: place.place_id,
		      location: place.geometry.location
		    }));
		    marker.setVisible(true);

		    infowindow.setContent('<div class="infobox"><strong>' + place.name + '</strong><br>' +
		        'Place ID: ' + place.place_id + '<br>' +
		        place.formatted_address + '<br><br>' + '</div>');
		    infowindow.open(map, marker);
		  });

			var service = new google.maps.places.PlacesService(map);

			service.nearbySearch(request, function(results, status) {
				//console.log(results);
	    	if (status == google.maps.places.PlacesServiceStatus.OK) {
	      	for (var i = 0; i < results.length; i++) {
	        	var place = results[i];

						$scope.places.push(place);

	      	}
					$scope.$apply(function(){});
					$scope.addMarkers($scope.places);
	    	}
	  	});
		});


	}

	$scope.addMarkers = function(array) {

		$.each(array, function(index, item){
			var infowindow = new google.maps.InfoWindow();

			var infoBox = '<div class="infobox">' + '<center>' +
			'<h3>' + item.name + '</h3>' +
			'<img src="' + item.icon + '"/>' + '<br>' +
			'<p>' + item.vicinity + '</p>' +
			'<p>' + item.types + '</p>' +
			'</center>' + '<div>';

			var marker = new google.maps.Marker({
				map: map,
				id: item.id,
				info : infoBox,
				animation: google.maps.Animation.DROP,
				position: item.geometry.location
			});

			$scope.mapMarkers.push({
				marker: marker,
				content: infoBox
			});

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.setContent(infoBox);
				map.setZoom(13);
				map.setCenter(marker.position);
				infowindow.open(map, marker);
				map.panBy(0, -125);
			});

		})

		//console.log($scope.mapMarkers);

	}

	$scope.showMarker = function(str) {
		//console.log(str);

		var infowindow = new google.maps.InfoWindow();
		var clickedItem = str.id;

		for (var key in $scope.mapMarkers) {
			if (clickedItem === $scope.mapMarkers[key].marker.id) {
				map.panTo($scope.mapMarkers[key].marker.position);
				map.setZoom(13);
				infowindow.setContent($scope.mapMarkers[key].content);
				infowindow.open(map, $scope.mapMarkers[key].marker);
				map.panBy(0, 125);
			}
		}

	}

	$scope.showMarkerTwo = function(str) {
		//console.log(str);

		var infowindow = new google.maps.InfoWindow();
		var clickedItem = str.id;

		for (var key in $scope.savedMarkers) {
			if (clickedItem === $scope.savedMarkers[key].marker.id) {
				map.panTo($scope.savedMarkers[key].marker.position);
				map.setZoom(13);
				infowindow.setContent($scope.savedMarkers[key].content);
				infowindow.open(map, $scope.savedMarkers[key].marker);
				map.panBy(0, 125);
			}
		}

	}

	$scope.addPlace = function(str) {
		//console.log(str);

		var message;

		var ask = confirm("Do You Want To Add This Location to Your Saved List?");

		if(ask == false) {
			//console.log("False.");
			return;
		}

		var askTwo = confirm('Do You Want to Attach a Message?');

		if(askTwo == true) {
			var p = prompt("Enter Message:");
			if(p == '') {
				alert("You Entered an Empty Message. Operation Aborted.");
				return;
			}
			if(p != '') {
				alert("Message Attached!");
				message = p;
			}
		}

		if(askTwo == false) {
			message = '-- No Message Was Attached --';
		}

		for(var key in $scope.travels) {
			if(str.id === $scope.travels[key].id) {
				alert("The Location You Are Trying to Add is Already in the Saved List.");
				return;
			}
		}

		var date = Date();

		$scope.travels.$add({
			name : str.name,
			location : str.vicinity,
			icon : str.icon,
			id : str.id,
			message : message,
			date : date
		});

		console.log("Admit One.");
		alert("Location Added To Saved!");

	}

}
]);

function bioLog() {

	$('#msg2').text("Welcome Traveler! This is a Website/Web Application that represents everywhere i've been in the world! \
	Click the marker icon to show the results from the autocomplete input. \
	Click the search icon to do a search. \
	The memory disk icon shows everywhere i've been to! The refresh icon is just to zoom out. \
	Click the add button from the results to store locations in the memory. \
	Take Care Traveler! Happy Journeys and Remember Your Travels!");
}

bioLog();

$(document).ready(function(){

	$('#me-icon').click(function(){

		if( $('#msg2').css('display') == 'none' ) {
			$('#msg2').show('fast');
		}
		else {
			$('#msg2').hide('fast');
		}

	});

});
