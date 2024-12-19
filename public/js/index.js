$(document).ready(function () {
  // Check if it's a new session
  if (!sessionStorage.getItem("visited")) {
    // Show the welcome modal
    $("#welcomeModal").modal("show");

    // Mark the session as visited
    sessionStorage.setItem("visited", "true");
  }
  // Add an onClick listener to the info button
  $("#viewInfo").on("click", function () {
    $("#welcomeModal").modal("show");
  });
  // Load the navbar and initialize the map
  $("#navbar").load("navbar.html");
  initMap();
});

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
    clickableIcons: false,
    gestureHandling: "greedy",
  });

  map.fitBounds(singaporeBounds);

  let markers = [];
  let userLocation = null;
  let carparkDataLoaded = false;

  const defaultIcon = {
    url: "../img/Marker.png",
    scaledSize: new google.maps.Size(21, 28),
  };

  const unavailableIcon = {
    url: "../img/UnavailableMarker.png",
    scaledSize: new google.maps.Size(21, 28),
  };

  const favouriteIcon = {
    url: "../img/FavouriteMarker.png",
    scaledSize: new google.maps.Size(21, 28),
  };

  function getFavouriteCarparks() {
    return JSON.parse(localStorage.getItem("favouriteCarparks")) || [];
  }

  function toggleFavourite(carparkID) {
    let favourites = getFavouriteCarparks();
    if (favourites.includes(carparkID)) {
      favourites = favourites.filter((id) => id !== carparkID);
    } else {
      favourites.push(carparkID);
    }
    localStorage.setItem("favouriteCarparks", JSON.stringify(favourites));
  }

  class CarparkAvailability {
    async fetchCarparkData() {
      try {
        const response = await fetch(
          "https://api.data.gov.sg/v1/transport/carpark-availability"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const carparkData = data.items[0].carpark_data;

        // Format the data as needed
        const formattedData = carparkData.map((carpark) => {
          return {
            carpark_number: carpark.carpark_number,
            total_lots: carpark.carpark_info[0].total_lots,
            lot_type: carpark.carpark_info[0].lot_type,
            lots_available: carpark.carpark_info[0].lots_available,
            update_datetime: data.items[0].timestamp,
          };
        });

        return formattedData;
      } catch (error) {
        console.error(`Error fetching carpark data: ${error.message}`);
        throw new Error("Failed to fetch carpark data");
      }
    }
  }

  async function fetchCarparkData() {
    try {
      const carparkAvailability = new CarparkAvailability();
      const availabilityData = await carparkAvailability.fetchCarparkData();

      const response = await fetch("../data/carparkInformation.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const infoData = await response.json();

      if (
        Array.isArray(availabilityData) &&
        infoData.success &&
        Array.isArray(infoData.data)
      ) {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        const favourites = getFavouriteCarparks();

        const carparks = infoData.data;
        const availability = availabilityData;

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

            const isFavourite = favourites.includes(carpark.car_park_no);
            const icon =
              availabilityInfo.lots_available === "0"
                ? unavailableIcon
                : isFavourite
                ? favouriteIcon
                : defaultIcon;

            const marker = new google.maps.Marker({
              position: carparkLocation,
              map: map,
              title: carpark.address,
              icon: icon,
            });

            marker.addListener("click", () => {
              showModal(carpark, availabilityInfo);
            });

            markers.push(marker);
            marker.carpark = carpark;
            marker.availability = availabilityInfo;
          }
        });

        new markerClusterer.MarkerClusterer({
          map,
          markers,
        });

        carparkDataLoaded = true;
      } else {
        console.error("Unexpected data format:", availabilityData, infoData);
      }
    } catch (error) {
      console.error("Error fetching carpark data:", error);
    }
  }

  function getFavouriteCarparks() {
    return JSON.parse(localStorage.getItem("favouriteCarparks")) || [];
  }

  function toggleFavourite(carparkID) {
    let favourites = getFavouriteCarparks();
    if (favourites.includes(carparkID)) {
      favourites = favourites.filter((id) => id !== carparkID);
    } else {
      favourites.push(carparkID);
    }
    localStorage.setItem("favouriteCarparks", JSON.stringify(favourites));
  }

  function showModal(carpark, availability) {
    const now = new Date();
    const lastUpdated = new Date(availability.update_datetime);
    const diff = Math.floor((now - lastUpdated) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    const lastUpdatedText =
      minutes > 0 ? `${minutes} min ${seconds} sec ago` : `${seconds} sec ago`;

    document.getElementById("carparkModalLabel").innerText = carpark.address;

    const freeParkingAvailable =
      carpark.free_parking && carpark.free_parking !== "NO"
        ? `Yes (${carpark.free_parking})`
        : "No";

    document.getElementById("modalFreeParking").innerText =
      freeParkingAvailable;
    document.getElementById("modalTotalLots").innerText =
      availability.total_lots;
    document.getElementById("modalAvailableLots").innerText =
      availability.lots_available;
    document.getElementById("modalLastUpdated").innerText = lastUpdatedText;

    const totalLots = parseInt(availability.total_lots);
    const availableLots = parseInt(availability.lots_available);
    const progressBar = document.getElementById("lotsProgressBar");

    if (availableLots === 0) {
      progressBar.style.width = "100%";
      progressBar.classList.add("full-lots");
      progressBar.innerText = "Full";
    } else {
      const percentage = Math.round((availableLots / totalLots) * 100);
      progressBar.style.width = `${percentage}%`;
      progressBar.classList.remove("full-lots");
      progressBar.innerText = `${percentage}%`;
    }
    progressBar.setAttribute("aria-valuenow", availableLots);

    const starIcon = document.getElementById("starIcon");
    starIcon.classList.toggle(
      "favourite",
      getFavouriteCarparks().includes(carpark.car_park_no)
    );

    starIcon.onclick = () => {
      toggleFavourite(carpark.car_park_no);
      fetchCarparkData();
      starIcon.classList.toggle("favourite");
    };

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${carpark.address}`;
    document
      .getElementById("viewOnGoogleMaps")
      .setAttribute("href", googleMapsLink);

    $("#carparkModal").modal("show");
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const liveLocationIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        };

        const userLocationMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          icon: liveLocationIcon,
          title: "You are here",
        });

        map.setCenter(userLocation);
        map.setZoom(17);

        fetchCarparkData();
      },
      (error) => {
        console.error("Error: Unable to retrieve your location.", error);
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
    fetchCarparkData();
  }

  setInterval(fetchCarparkData, 60000);

  // Add Autocomplete functionality for the search bar
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("location-input"),
    {
      fields: ["geometry", "name"],
      types: ["address"],
    }
  );

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      alert(`No details available for input: '${place.name}'`);
      return;
    }

    // Center map to the selected place
    map.setCenter(place.geometry.location);
    map.setZoom(17);
  });

  // Add functionality for "Jump Back to Location" button
  document
    .getElementById("jumpBackToLocation")
    .addEventListener("click", () => {
      if (userLocation) {
        map.setCenter(userLocation);
        map.setZoom(17);
      } else {
        alert("User location not available.");
      }
    });
}

document.addEventListener("DOMContentLoaded", initMap);
