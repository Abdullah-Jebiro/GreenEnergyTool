let baseUrl = "https://localhost:5001"; // Change to production URL when needed
let accessToken = "";
let entryDate = '';
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
    fetchLatestRecord(0);
  } else {
    document.getElementById("message").textContent =
      response.status === 401 ? "Unauthorized: Login failed." : "Login failed.";
  }
}

// Call the function to check stored credentials when the page loads
checkStoredCredentials();


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
    showPopup("تم الحذف", 3); // Call the function to show the popup for 10 seconds
    login();
  } else if (response.status === 401) {
    login(); // Attempt to log in again if unauthorized
  } else {
    document.getElementById("message").textContent =
      "An error occurred while deleting the record.";
  }
}




// Send delete request
async function deleteStation() {
  const stationId = 0


  const result = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: ` ${entryDate} ستقوم بحذف سجل ` ,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'نعم، احذفها!',
    cancelButtonText: 'لا، ألغِ'
  });

  // If the user confirmed the deletion
  if (result.isConfirmed) {
    const response = await fetch(`${baseUrl}/api/StationMonitors/remove-latest`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ stationId: parseInt(stationId) }),
    });

    if (response.ok) {
      // Show a success popup message
      showPopup("تم الحذف", 3); // Show the popup for 3 seconds
      login();
    } else if (response.status === 401) {
      login(); // Attempt to log in again if unauthorized
    } else {
      document.getElementById("message").textContent = "حدث خطأ أثناء حذف السجل.";
    }
  }
}

// Function to show popup message
// Function to show popup message
function showPopup(message, duration) {
  Swal.fire({
    title: "تم",
    text: message,
    icon: "success", // or 'error', 'warning', 'info', 'question'
    confirmButtonText: "موافق", // Only the OK button
    timer: duration * 1000, // Auto close after duration
    timerProgressBar: true,
    onClose: () => {
      clearTimeout(timer); // Clear the timer if popup is closed
    },
  });
}

// Display the fetched data on the page
function displayData(data) {
  const messageDiv = document.getElementById("message");
  entryDate = data.entryDate.replace("T"," ");
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
document.getElementById("deleteButton").addEventListener("click", deleteStation);
