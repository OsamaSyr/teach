$(document).ready(function () {
  if (document.getElementById("loginForm")) {
    $("#loginForm").on("submit", function (e) {
      e.preventDefault();

      const userId = $("#userId").val();
      const password = $("#password").val();
      const { fingerprint, deviceSpecs } = getDeviceFingerprint();

      $.ajax({
        url: "/api/auth/login",
        method: "POST",
        data: JSON.stringify({
          userId,
          password,
          deviceFingerprint: fingerprint,
          deviceSpecs,
        }),
        contentType: "application/json",
        success: function (response) {
          window.location.href = response.redirectTo;
        },
        error: function (err) {
          alert(
            "Login failed: " + (err.responseJSON.message || "Unknown error")
          );
        },
      });
    });
  }
});
