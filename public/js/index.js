function svy21ToWgs84(x, y) {
  const svy21 = proj4(
    "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +datum=WGS84 +to_meter=1"
  );
  const wgs84 = proj4("EPSG:4326");
  const [longitude, latitude] = proj4(svy21, wgs84, [x, y]);

  return { latitude, longitude };
}

function initMap() {
  const singaporeBounds = {
    north: 1.4771,
    south: 1.1496,
    east: 104.1236,
    west: 103.596,
  };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.3521, lng: 103.8198 },
    zoom: 17,
  });

  map.fitBounds(singaporeBounds);

  let markers = [];
  let userLocation = null;
  let carparkDataLoaded = false;
  let userLocationLoaded = false;

  const defaultIcon = {
    url: "../img/Marker.png",
    scaledSize: new google.maps.Size(22, 28), // Set the size of the default marker
  };

  const selectedIcon = {
    url: "../img/SelectedMarker.png",
    scaledSize: new google.maps.Size(22, 28), // Set the size of the selected marker
  };

  const unavailableIcon = {
    url: "../img/UnavailableMarker.png",
    scaledSize: new google.maps.Size(22, 28), // Set the size of the unavailable marker
  };

  function displayNearestCarparks() {
    if (userLocationLoaded && carparkDataLoaded) {
      // Filter only available carparks
      const availableMarkers = markers.filter(
        (marker) => marker.availability.lots_available > 0
      );
      const nearestCarparks = findNearestCarparks(
        userLocation,
        availableMarkers,
        5
      );

      // Reset all markers to the normal or unavailable icon
      markers.forEach((marker) => {
        if (marker.availability.lots_available === 0) {
          marker.setIcon(unavailableIcon); // Use unavailable marker icon for carparks with 0 availability
        } else {
          marker.setIcon(defaultIcon); // Resets to the normal marker icon
        }
      });

      if (nearestCarparks.length > 0) {
        // Change the icon of the nearest 5 available carpark markers to the selected marker icon
        nearestCarparks.forEach(({ marker }) => {
          marker.setIcon(selectedIcon); // Selected marker icon
        });

        displayCarparksDetails(nearestCarparks);
      }
    }
  }

  function fetchCarparkData() {
    fetch(`${window.location.origin}/api/carparkAvailability/`)
      .then((response) => response.json())
      .then((availabilityData) => {
        fetch(`${window.location.origin}/api/carparkInformation/`)
          .then((response) => response.json())
          .then((infoData) => {
            if (
              availabilityData.success &&
              infoData.success &&
              Array.isArray(availabilityData.data) &&
              Array.isArray(infoData.data)
            ) {
              // Clear old markers
              markers.forEach((marker) => marker.setMap(null));
              markers = [];

              const carparks = infoData.data;
              const availability = availabilityData.data;

              carparks.forEach((carpark) => {
                const availabilityInfo = availability.find(
                  (a) => a.carpark_number === carpark.car_park_no
                );
                if (availabilityInfo) {
                  const { latitude, longitude } = svy21ToWgs84(
                    parseFloat(carpark.x_coord),
                    parseFloat(carpark.y_coord)
                  );

                  const carparkLocation = { lat: latitude, lng: longitude };

                  const marker = new google.maps.Marker({
                    position: carparkLocation,
                    map: map,
                    title: carpark.address,
                    icon:
                      availabilityInfo.lots_available === 0
                        ? unavailableIcon
                        : defaultIcon, // Use the unavailable icon if no lots available
                  });

                  // Add a click listener for showing the modal with carpark details
                  marker.addListener("click", () => {
                    showModal(carpark, availabilityInfo);
                    marker.setIcon(selectedIcon); // Change to selected marker icon on click
                  });

                  markers.push(marker);

                  // Attach carpark and availability info to the marker
                  marker.carpark = carpark;
                  marker.availability = availabilityInfo;
                }
              });

              new markerClusterer.MarkerClusterer({
                map,
                markers,
              });

              carparkDataLoaded = true;
              displayNearestCarparks();
            } else {
              console.error(
                "Unexpected data format:",
                availabilityData,
                infoData
              );
            }
          })
          .catch((error) => {
            console.error("Error fetching carpark information data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching carpark availability data:", error);
      });
  }

  function displayCarparksDetails(nearestCarparks) {
    const detailsPanel = document.getElementById("carpark-info");
    detailsPanel.innerHTML = nearestCarparks
      .map(
        ({ carpark, availability }) => `
        <div class="carpark-detail">
          <h4>${carpark.address}</h4>
          <p>Total Lots: ${availability.total_lots}</p>
          <p>Available Lots: ${availability.lots_available}</p>
          <p>Last Updated: ${new Date(
            availability.update_datetime
          ).toLocaleString()}</p>
        </div>
      `
      )
      .join("");

    // Add scrollable class to make the panel scrollable
    detailsPanel.classList.add("scrollable");
  }

  function showModal(carpark, availability) {
    // Populate the modal fields
    document.getElementById("modalAddress").innerText = carpark.address;
    document.getElementById("modalFreeParking").innerText =
      carpark.free_parking_now ? "Yes" : "No";
    document.getElementById("modalTotalLots").innerText =
      availability.total_lots;
    document.getElementById("modalAvailableLots").innerText =
      availability.lots_available;
    document.getElementById("modalLastUpdated").innerText = new Date(
      availability.update_datetime
    ).toLocaleString();

    // Show the modal
    $("#carparkModal").modal("show");
  }

  function findNearestCarparks(userLocation, markers, count = 5) {
    const distances = markers.map((marker) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        userLocation,
        marker.getPosition()
      );
      return { marker, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, count).map((d) => ({
      marker: d.marker,
      carpark: d.marker.carpark,
      availability: d.marker.availability,
    }));
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Clear any previous marker
        if (window.userLocationMarker) {
          window.userLocationMarker.setMap(null);
        }

        // Define the custom icon for live location
        const liveLocationIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        };

        window.userLocationMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          icon: liveLocationIcon,
          title: "You are here",
        });

        map.setCenter(userLocation);
        map.setZoom(17);

        userLocationLoaded = true;
        displayNearestCarparks();
      },
      (error) => {
        console.error("Error: Unable to retrieve your location.", error);
        // Proceed with fetching carpark data even without user location
        fetchCarparkData();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    console.error("Error: Your browser doesn't support geolocation.");
    // Proceed with fetching carpark data even without user location
    fetchCarparkData();
  }

  // Fetch carpark data initially and every minute
  fetchCarparkData();
  setInterval(fetchCarparkData, 60000);
}

document.addEventListener("DOMContentLoaded", initMap);
