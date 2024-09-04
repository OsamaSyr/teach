$(document).ready(function () {
  if (document.getElementById("playlistContainer")) {
    function loadPlaylists() {
      $.ajax({
        url: "/api/student/playlists",
        method: "GET",
        success: function (response) {
          console.log("Playlists fetched:", response); // Log the response
          const playlists = response.playlists;
          let content = "";
          playlists.forEach((playlist) => {
            content += `
                            <div class="col-md-4">
                                <div class="card mb-4">
                                    <div class="card-body">
                                        <h5 class="card-title">${playlist.title}</h5>
                                        <button class="btn btn-primary view-playlist-btn" data-id="${playlist._id}">الدخول الى المادة</button>
                                    </div>
                                </div>
                            </div>`;
          });
          $("#playlistContainer").html(content);
        },
        error: function (xhr, status, error) {
          console.error("Error fetching playlists:", status, error); // Log the error
          alert("Failed to load playlists");
        },
      });
    }
    loadPlaylists();

    $(document).on("click", ".view-playlist-btn", function () {
      const playlistId = $(this).data("id");
      window.location.href = `playlist.html?playlistId=${playlistId}`;
    });
  }
});
