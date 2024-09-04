function getDeviceFingerprint() {
  let fingerprint = getCookie("deviceFingerprint");
  if (!fingerprint) {
    fingerprint = generateUUID();
    setCookie("deviceFingerprint", fingerprint, 365);
  }

  const deviceSpecs = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    language: navigator.language,
  };

  return { fingerprint, deviceSpecs };
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

$(document).ready(function () {
  $("#logoutBtn").on("click", function () {
    $.ajax({
      url: "/api/auth/logout",
      method: "POST",
      success: function () {
        window.location.href = "index.html";
      },
      error: function () {
        alert("Failed to logout");
      },
    });
  });
});
