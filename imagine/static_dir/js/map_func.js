function initialize() {
  var map
  var prompt_window
  var myOptions = {
    center: new google.maps.LatLng(33.7489, -84.3881),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    scaleControl: false,
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_TOP
    }
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
      myOptions);

  var image = new google.maps.MarkerImage('static/img/icon.png',
              // This marker is 20 pixels wide by 32 pixels tall.
              new google.maps.Size(25, 16),
              // The origin for this image is 0,0.
              new google.maps.Point(0,0),
              // The anchor for this image is the base of the flagpole at 0,32.
              new google.maps.Point(12, 16));

  var infowindow = new google.maps.InfoWindow({
      maxWidth: 150
  });

  // This window will only be displayed if users do not 
  // allow or do not have geolocation.

  
  // Add markers
  {% for photo in photos_list %}
  var marker{{photo.id}} = new google.maps.Marker({
    position: new google.maps.LatLng({{ photo.latitude }}, {{ photo.longitude }}), 
    map: map,
    icon: image,
    title: '{{ photo.caption }}'
  });   

  var contentString{{ photo.id }} = '<a href="{{ photo.image }}" class="fancybox"><img src="{{photo.thumbnail}}"></a><p>{{ photo.caption }}</p>';

  // Listen for click for marker id {{ photo.id }}
  google.maps.event.addListener(marker{{ photo.id }}, 'click',function() {
      infowindow.open(map,marker{{ photo.id }});
      // Set content
      infowindow.setContent(contentString{{ photo.id }});
  });
  {% endfor %}

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos);
    }, function() {
      // Geolocation denied
      no_geolocation(true);  
    });

  }
  else {
    // No support
    no_geolocation(false);
  }

  // If it fails or was denied, prompt user for address and use
  // Google's geocoder API
  function no_geolocation(error) {
        if (error) {
          var content = '<h2>Oh no!</h2> <p style="text-align:center">The Geolocation service failed. ';
        } else {
          var content = '<h4>Oh no!</h4> <p>Your browser doesn\'t support geolocation.';
        }

        content += "Where do you want to go?</p><form target='none' id='manual_locate'><input type='text' id='address'></input><input type='submit' value='Go there!'/></form>";

        var options = {
          maxWidth: 500,
          map: map,
          position: map.getCenter(),
          content: content
        };

        prompt_window = new google.maps.InfoWindow(options);
        map.setCenter(options.position);
  }

  // If you receive input, recenter map.
  $('body').on('submit', '#manual_locate', function(){
    var address = $('#address').val();
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        prompt_window.close();
      } else {
        alert("Geocode was not successful for the following reason: " + status);
        prompt_window.close();
      }
    });
   return false; 
  });
  
}