function initMap() {
  // Default map center to cover Singapore
  const singaporeBounds = {
    north: 1.4771,
    south: 1.1496,
    east: 104.1236,
    west: 103.596,
  };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.3521, lng: 103.8198 }, // Center of Singapore
    zoom: 11,
  });

  // Adjust map to fit Singapore's bounds
  map.fitBounds(singaporeBounds);

  // Fetch carpark availability data
  fetch(`${window.location.origin}/api/carparkAvailability/`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Carpark data:", data); // Log the data to check its structure

      // Assuming data has a "carparks" array; adjust according to your API structure
      const carparks = data.carparks || [];

      if (Array.isArray(carparks)) {
        const markers = carparks.map((carpark) => {
          const carparkLocation = {
            lat: carpark.latitude,
            lng: carpark.longitude,
          };
          console.log(
            `Creating marker at ${carparkLocation.lat}, ${carparkLocation.lng}`
          );
          return new google.maps.Marker({
            position: carparkLocation,
            title: carpark.name,
            map: map, // Ensure the marker is associated with the map
          });
        });

        // Create a MarkerClusterer to manage the markers
        const markerCluster = new markerClusterer.MarkerClusterer({
          map,
          markers,
        });
      } else {
        console.error("Unexpected data format:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching carpark data:", error);
    });

  // Request user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);
        map.setZoom(15); // Zoom in on user's location
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
        });
      },
      () => {
        console.error("Error: Unable to retrieve your location.");
      }
    );
  } else {
    console.error("Error: Your browser doesn't support geolocation.");
  }
}

// Initialize the map after the page has loaded
document.addEventListener("DOMContentLoaded", initMap);
