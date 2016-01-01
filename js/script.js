function app() {
  var map;

//map initialization function//

  function initMap(){
  var myPlace = new google.maps.LatLng(41.878114,-87.629798);
         // var infowindow = new google.maps.InfoWindow();
          var mapOptions = {
           center: myPlace,
            zoom: 6
            };
            map = new google.maps.Map(document.getElementById("map-container"),
            mapOptions);

  }


  var places = ko.observableArray ([
      {
          name: "Six Flags Great America",
          mylat: 42.377254,
          mylong: -87.934657,
          myData: '',
          id: "place1"
      },
      {
          name: "Chicago Theatre",
          mylat: 42.578924,
          mylong: -88.560553,
          myData: '',
          id: "place2"
      },
      {
          name: "360 Chicago",
          mylat: 40.249575,
          mylong: -94.338388,
          myData: '',
          id: "place3"
      },
      {
          name: "Shedd aquarium",
          mylat: 41.878114,
          mylong: -87.629798,
          myData: '',
          id: "place4"
      },
      {
          name: "Michigan Lake",
          mylat: 43.851968,
          mylong: -85.005307,
          myData: '',
          id: "place5"
      }
  ]);

  // viemodel definition //
 var ViewModel = function() {
  var self=this;
  var bounds = new google.maps.LatLngBounds();

//markers encapsulation for interaction with google maps//
 var Pointer = function (map, name, mylat, mylong, myData) {

    this.name = ko.observable(name);
    this.lat  = ko.observable(mylat);
    this.lon  = ko.observable(mylong);
    this.myData = ko.observable(myData);

    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(mylat, mylong),
      animation: google.maps.Animation.DROP,
      map:map
    });
    //extend bounds to include this location
    bounds.extend(this.marker.position);
  }; //close pointer constructor//

 var infowindow = new google.maps.InfoWindow();

  // add markers//

  for (i=0 ; i < places().length; i++) {
    places()[i].pointer =  new Pointer (map, places()[i].name, places()[i].mylat, places()[i].mylong, places()[i].myData);

    var content = places()[i].pointer.myData();
    var heading = places()[i].pointer.name();

    google.maps.event.addListener(places()[i].pointer.marker ,'click', (function(pointer,content,infowindow, heading){

      return function() {
        viewModel.getWikis(heading, infowindow);
        infowindow.open(map,pointer.marker);
        pointer.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { pointer.marker.setAnimation(null); }, 750);
      };
    })(places()[i].pointer, content, infowindow, heading));
  } // closing marker creation loop//

    map.fitBounds(bounds);

  // Filter and search//

  self.locations = ko.observableArray(places());
  self.visibleLocations = ko.observableArray();
  self.query = ko.observable('');
  self.search = ko.computed(function(){
    self.visibleLocations.removeAll();  // clear array of visible locations//
    var filter = self.query().toLowerCase(); // lowercase search term//

    //loop through each item in self.locations//
    ko.utils.arrayFilter(self.locations(), function(location) {

       var searchIndex = location.name.toLowerCase().indexOf(filter);

       //does the location name contain the search term?

       if (searchIndex >= 0) {
        location.pointer.marker.setVisible(true); // show the map marker
        self.visibleLocations.push(location); // add this loaction to visible locations array
       }
      else {
        location.pointer.marker.setVisible(false); // hide the map marker
      }
    });
    return self.visibleLocations(); //return visible locations
  }); // close filter and search


  self.getWikis = function(heading, infowindow) {
    //get Wiki articles
    var thePlace = heading;
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + thePlace  +
                  '&format=json&callback=wikiCallback';
    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      timeout: 8000,
      //jsonp: "callback",
      success: function ( response) {
          var articleStr = response[0];
          var url = 'http://en.wikipedia.org/wiki/' + articleStr;

          content = url;
          infowindow.setContent('<h4>' + heading + '</h4>' + '<a href="' + content + '">' + 'Wikipedia Link to ' +
                  heading + '</a>');
        }

    }).fail(function(x, t, m) {
        if (t==='timeout'){alert("got timeout");
          } else {
            alert(t);
          }
  });

  }; //end getWikis


  self.listItemClick = function(item) {
  clickedMarker = item.pointer.marker;
  google.maps.event.trigger(clickedMarker, 'click');
  };
  };//end viewmodel
  var viewModel;

  //function to call map initialization and apply bindings
  function startApp() {
   initMap();
   viewModel = new ViewModel();
   ko.applyBindings(viewModel);
    }

  startApp();

  }