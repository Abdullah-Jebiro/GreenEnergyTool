let baseUrl = "https://localhost:5001"; // Change to production URL when needed
let accessToken = "";

// Function to check for stored credentials and log in if they exist
function checkStoredCredentials() {
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  if (email && password) {
    document.getElementById("email").value = email;
    document.getElementById("password").value = password;
    login(); // Attempt to log in with stored credentials
  } else {
    document.getElementById("loginArea").style.display = "block"; // Show login form
  }
}

// Login function
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${baseUrl}/api/Users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    accessToken = data.accessToken;

    // Save email and password to local storage
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    document.getElementById("loginArea").style.display = "none";
    document.getElementById("deleteButton").style.display = "block";
    fetchStations();
    fetchLatestRecord(0);
  } else {
    document.getElementById("message").textContent =
      response.status === 401 ? "Unauthorized: Login failed." : "Login failed.";
  }
}

// Call the function to check stored credentials when the page loads
checkStoredCredentials();

// Fetch stations from API
async function fetchStations() {
  const response = await fetch(`${baseUrl}/api/Stations?Category=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const select = document.getElementById("stationSelect");
    data.forEach((station) => {
      const option = document.createElement("option");
      option.value = station.id;
      option.textContent = station.title;
      select.appendChild(option);
    });
  } else if (response.status === 401) {
    login(); // Attempt to log in again if unauthorized
  } else {
    document.getElementById("message").textContent =
      "Failed to fetch stations.";
  }
}

// Fetch the latest record
async function fetchLatestRecord(stationId) {
  const response = await fetch(
    `${baseUrl}/api/StationMonitors/latest/${stationId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    displayData(data);
  } else if (response.status === 401) {
    login(); // Attempt to log in again if unauthorized
  } else {
    document.getElementById("message").textContent = "Failed to fetch data.";
  }
}

// Send delete request
// Send delete request
async function deleteStation() {
  //const select = document.getElementById("stationSelect");
  //const stationId = select.value; // Get the selected station ID
  const stationId = 0; // Get the selected station ID


  const response = await fetch(`${baseUrl}/api/StationMonitors/remove-latest`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ stationId: parseInt(stationId) }),
  });

  if (response.ok) {
    // Show a popup message
    showPopup("تم الحذف", 5); // Call the function to show the popup for 10 seconds
    fetchLatestRecord(stationId); // Fetch the latest record after deletion
  } else if (response.status === 401) {
    login(); // Attempt to log in again if unauthorized
  } else {
    document.getElementById("message").textContent =
      "An error occurred while deleting the record.";
  }
}

// Function to show popup message
function showPopup(message, duration) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.top = "50%"; // Center it vertically
    popup.style.left = "50%"; // Center it horizontally
    popup.style.transform = "translate(-50%, -50%)"; // Adjust for centering
    popup.style.backgroundColor = "green"; // Change to desired color
    popup.style.color = "white";
    popup.style.padding = "20px";
    popup.style.borderRadius = "5px";
    popup.style.zIndex = "1000"; // Ensure it appears on top of other elements
    popup.style.textAlign = "center"; // Center text
    popup.style.width = "80%"; // Set width with unit
    popup.style.height = "50%"; // Set height with unit
    popup.style.boxSizing = "border-box"; // Include padding in width/height
    document.body.appendChild(popup);
  
    // Remove the popup after the specified duration
    setTimeout(() => {
      document.body.removeChild(popup);
    }, duration * 1000);
  }

// Display the fetched data on the page
function displayData(data) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = `
      <h2 style="color: black;">بيانات السجل الأخير:</h2>
      <p style="color: black; font-size: 1.5em;">تاريخ الإدخال:</p>
      <p style="color: black; font-size: 1.5em;"><strong></strong> ${data.entryDate.replace(
        "T",
        " "
      )}</p>
      
        <p></p>
        <p></p>
        <p></p>


    `;
}

// Event listeners
document.getElementById("loginButton").addEventListener("click", login);
document
  .getElementById("deleteButton")
  .addEventListener("click", deleteStation);
document.getElementById("stationSelect").addEventListener("change", (e) => {
  fetchLatestRecord(e.target.value);
});
