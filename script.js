let baseUrl = "http://devgreenenergy.runasp.net"; // Change to production URL when needed
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
    document.getElementById("deleteArea").style.display = "block";
    fetchLatestRecord(0);
  } else {
    // Show an error popup message in Arabic
    const errorMessage = response.status === 401 ? "غير مصرح: فشل تسجيل الدخول." : "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.";
    Swal.fire({
      title: 'خطأ',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'موافق',
    });
  }
}

// Call the function to check stored credentials when the page loads
checkStoredCredentials();

// Fetch the latest record
async function fetchLatestRecord(stationId) {
  const response = await fetch(`${baseUrl}/api/StationMonitors/latest/${stationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    displayData(data);
  } else if (response.status === 401) {
    login(); // Attempt to log in again if unauthorized
  } else {
    document.getElementById("message").textContent = "Failed to fetch data.";
  }
}

function showPopup(message, duration) {
  Swal.fire({
    title: "تم",
    text: message,
    icon: "success",
    confirmButtonText: "موافق",
    timer: duration * 1000,
    timerProgressBar: true,
  });
}

async function deleteStation() {
  const stationId = 0;

  const result = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: `${entryDate} ستقوم بحذف سجل`,
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
      showPopup("تم الحذف", 3); // Show the popup for 3 seconds
      fetchLatestRecord(0); // Refresh the latest records
    } else if (response.status === 401) {
      login(); // Attempt to log in again if unauthorized
    } else {
      document.getElementById("message").textContent = "حدث خطأ أثناء حذف السجل.";
    }
  }
}

// Display the fetched data on the page
function displayData(data) {
  const messageDiv = document.getElementById("message");
  entryDate = data.entryDate.replace("T", " ");
  messageDiv.innerHTML = `
      <h2 style="color: black;">تاريخ الإدخال - بيانات السجل الأخير</h2>
      <p style="color: black; font-size: 1.5em;"><strong></strong> ${entryDate}</p>
  `;
}

// Event listeners
document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("deleteButton").addEventListener("click", deleteStation);