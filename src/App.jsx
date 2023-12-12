// Import necessary hooks from React
import { useState, useEffect } from "react";

import { lla2xyz, xyz2enu } from "/conversions.js";

// Import necessary components from react-leaflet
import { Marker, Popup } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS

// Import Chart component from react-google-charts
import { Chart } from "react-google-charts";

// Import Socket.IO client
import io from "socket.io-client";

function App() {
  // Define a state variable 'location' to store the latitude and longitude
  const [location, setLocation] = useState(null);
  // Define a state variable 'enu' to store the ENU coordinates
  const [enu, setEnu] = useState(null);
  // Define a state variable 'readings' to store all XYZ readings
  const [readings, setReadings] = useState([]);
  // Define a state variable 'enuData' to store all ENU coordinates for the chart
  const [enuData, setEnuData] = useState([["East", "North", "Up"]]);

  // Use the useEffect hook to run code when the component mounts
  useEffect(() => {
    // Connect to the server using Socket.IO
    var socket = io("http://localhost:3001");

    // Listen for 'gnss-data' events from the server
    socket.on("gnss-data", function (gnssData) {
      // Extract latitude and longitude from the received data
      var latitude = gnssData.latitude;
      var longitude = gnssData.longitude;

      // Update the location state with the new latitude and longitude
      setLocation({ latitude, longitude });

      // Convert latitude and longitude to XYZ
      var xyz = lla2xyz(latitude, longitude, 51.5); // Altitude is hard coded to 51.5 meters

      // Add the new XYZ reading to the readings array and calculate averages
      setReadings((readings) => {
        const newReadings = [...readings, xyz];

        let x_tot = 0;
        let y_tot = 0;
        let z_tot = 0;

        for (let i = 0; i < newReadings.length; i++) {
          x_tot += newReadings[i][0];
          y_tot += newReadings[i][1];
          z_tot += newReadings[i][2];
        }
        const x_avg = x_tot / newReadings.length;
        const y_avg = y_tot / newReadings.length;
        const z_avg = z_tot / newReadings.length;

        // Convert XYZ to ENU
        var enu = xyz2enu(
          xyz[0] - x_avg,
          xyz[1] - y_avg,
          xyz[2] - z_avg,
          latitude,
          longitude
        );
        setEnu(enu);
        console.log("xyz", xyz[0] - x_avg, xyz[1] - y_avg, xyz[2] - z_avg);
        // Add the new ENU coordinates to the enuData array
        setEnuData((enuData) => [...enuData, enu]);

        return newReadings;
      });
    });
  }, []);

  // Render the map and chart if location and ENU data are available
  return (
    location &&
    enu && (
      <div>
        <MapContainer
          // Set the center of the map to the received latitude and longitude
          center={[location.latitude, location.longitude]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "75vh", width: "100vw" }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              Latitude: {location.latitude}
              <br />
              Longitude: {location.longitude}
            </Popup>
          </Marker>
        </MapContainer>
        <Chart
          width={"900px"}
          height={"500px"}
          chartType="LineChart"
          loader={<div>Loading Chart</div>}
          data={enuData}
          options={{
            title: "ENU Data",
            hAxis: { title: "East" },
            vAxis: { title: "North" },
          }}
        />
      </div>
    )
  );
}

export default App;
