$(document).ready(function () {
  if (document.getElementById("videoPlayerContainer")) {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get("playlistId");

    function loadPlaylist() {
      $.ajax({
        url: `/api/student/playlists/${playlistId}`,
        method: "GET",
        success: function (response) {
          const playlist = response.playlist;
          $("#playlistTitle").text(playlist.title);
          const videoList = $("#videoList");
          videoList.empty();

          playlist.videos.forEach((video, index) => {
            videoList.append(`
                            <li class="list-group-item video-item" data-video-id="${video._id}">
                                ${video.title}
                            </li>
                        `);
          });

          if (playlist.videos.length > 0) {
            loadVideo(playlistId, playlist.videos[0]._id); // Load the first video
          }
        },
        error: function () {
          alert("Failed to load playlist details");
        },
      });
    }

    function loadVideo(playlistId, videoId) {
      $.ajax({
        url: `/api/student/playlists/${playlistId}/videos/${videoId}`,
        method: "GET",
        success: function (response) {
          const videoUrl = response.video.url; // URL provided by your API for the video

          const videoPlayerContainer = $("#videoPlayerContainer");
          videoPlayerContainer.empty();

          const vdoPlayer = `<iframe src="${videoUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
          videoPlayerContainer.html(vdoPlayer);
        },
        error: function () {
          alert("Failed to load video details");
        },
      });
    }

    $(document).on("click", ".video-item", function () {
      const videoId = $(this).data("video-id");
      loadVideo(playlistId, videoId);
    });

    $("#backBtn").on("click", function () {
      window.location.href = "student.html";
    });

    loadPlaylist();
  }
});
