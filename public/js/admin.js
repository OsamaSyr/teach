$(document).ready(function () {
  if (
    document.getElementById("userList") ||
    document.getElementById("playlistList")
  ) {
    function loadUsers() {
      $.ajax({
        url: "/api/admin/users",
        method: "GET",
        success: function (response) {
          const users = response.users;
          let content = "";
          users.forEach((user) => {
            content += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${user.userId} (${user.role})
                            <div>
                                <button class="btn btn-sm btn-info view-devices-btn" data-id="${user._id}">View Devices</button>
                                <button class="btn btn-sm btn-warning edit-user-btn" data-id="${user._id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user._id}">Delete</button>
                                <button class="btn btn-sm btn-primary assign-playlist-btn" data-id="${user._id}">Assign Playlists</button>
                            </div>
                        </li>`;
          });
          $("#userList").html(content);
        },
        error: function () {
          alert("Failed to load users");
        },
      });
    }

    // Load playlists
    function loadPlaylists() {
      $.ajax({
        url: "/api/admin/playlists",
        method: "GET",
        success: function (response) {
          const playlists = response.playlists;
          let content = "";
          playlists.forEach((playlist) => {
            content += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${playlist.title}
                                <div>
                                    <button class="btn btn-sm btn-warning edit-playlist-btn" data-id="${playlist._id}">Edit</button>
                                    <button class="btn btn-sm btn-danger delete-playlist-btn" data-id="${playlist._id}">Delete</button>
                                </div>
                            </li>`;
          });
          $("#playlistList").html(content);
        },
        error: function () {
          alert("Failed to load playlists");
        },
      });
    }

    function loadUserDevices(userId) {
      $.ajax({
        url: `/api/admin/user/${userId}/devices`,
        method: "GET",
        success: function (response) {
          const devicesList = $("#devicesList");
          devicesList.empty();

          response.devices.forEach((device) => {
            const specs = device.specs;
            devicesList.append(`
                    <li class="list-group-item">
                      <div><strong>Fingerprint:</strong> ${device.fingerprint}</div>
                      <div><strong>User Agent:</strong> ${specs.userAgent}</div>
                      <div><strong>Platform:</strong> ${specs.platform}</div>
                      <div><strong>Screen Resolution:</strong> ${specs.screenResolution}</div>
                      <div><strong>Color Depth:</strong> ${specs.colorDepth}</div>
                      <div><strong>Language:</strong> ${specs.language}</div>
                      <button class="btn btn-sm btn-danger delete-device-btn" data-id="${userId}" data-device="${device.fingerprint}">Delete</button>
                    </li>
                  `);
          });

          $("#manageDevicesModal").modal("show");
        },
        error: function () {
          alert("Failed to load devices");
        },
      });
    }

    function deleteDevice(userId, device) {
      const encodedDevice = encodeURIComponent(device); // Encode the device string
      if (confirm("Are you sure you want to delete this device?")) {
        $.ajax({
          url: `/api/admin/user/${userId}/devices/${encodedDevice}`,
          method: "DELETE",
          success: function () {
            console.log("Device deleted successfully"); // Add this for debugging
            loadUserDevices(userId); // Reload the devices list
          },
          error: function (err) {
            console.error("Failed to delete device:", err); // Log error details
            alert("Failed to delete device");
          },
        });
      }
    }

    loadUsers();
    loadPlaylists();

    $("#addUserBtn").on("click", function () {
      $("#addUserForm").trigger("reset");
      $("#addUserModal").modal("show");

      $("#addUserForm")
        .off("submit")
        .on("submit", function (e) {
          e.preventDefault();
          const userId = $("#newUserId").val();
          const password = $("#newUserPassword").val();
          const role = $("#newUserRole").val();
          const maxComputers = $("#newMaxComputers").val();

          $.ajax({
            url: "/api/admin/user",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId, password, role, maxComputers }),
            success: function () {
              $("#addUserModal").modal("hide");
              loadUsers();
            },
            error: function () {
              alert("Failed to add user");
            },
          });
        });
    });

    // Edit User Functionality
    $(document).on("click", ".edit-user-btn", function () {
      const userId = $(this).data("id");
      $.ajax({
        url: `/api/admin/user/${userId}`,
        method: "GET",
        success: function (response) {
          const user = response.user;
          $("#editUserId").val(user.userId).prop("readonly", true);
          $("#editUserRole").val(user.role);
          $("#editMaxComputers").val(user.maxComputers);
          $("#editUserPassword").val(""); // Clear the password field for security reasons

          $("#editUserModal").modal("show");

          $("#editUserForm")
            .off("submit")
            .on("submit", function (e) {
              e.preventDefault();
              const role = $("#editUserRole").val();
              const maxComputers = $("#editMaxComputers").val();
              const password = $("#editUserPassword").val();
              const data = { role, maxComputers };
              if (password) data.password = password;

              $.ajax({
                url: `/api/admin/user/${userId}`,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function () {
                  $("#editUserModal").modal("hide");
                  loadUsers();
                },
                error: function () {
                  alert("Failed to update user");
                },
              });
            });
        },
        error: function () {
          alert("Failed to load user details");
        },
      });
    });

    // Delete User Functionality
    $(document).on("click", ".delete-user-btn", function () {
      const userId = $(this).data("id");
      if (confirm("Are you sure you want to delete this user?")) {
        $.ajax({
          url: `/api/admin/user/${userId}`,
          method: "DELETE",
          success: function () {
            loadUsers();
          },
          error: function () {
            alert("Failed to delete user");
          },
        });
      }
    });

    // Load User Devices on Button Click
    $(document).on("click", ".view-devices-btn", function () {
      const userId = $(this).data("id");
      loadUserDevices(userId);
    });

    // Delete Device Functionality
    $(document).on("click", ".delete-device-btn", function () {
      const userId = $(this).data("id");
      const device = $(this).data("device");
      deleteDevice(userId, device);
    });

    // Assign Playlist to User Functionality
    $(document).on("click", ".assign-playlist-btn", function () {
      const userId = $(this).data("id");
      $.ajax({
        url: `/api/admin/user/${userId}/playlists`,
        method: "GET",
        success: function (response) {
          const user = response.user;
          const assignedPlaylistsContainer = $("#assignedPlaylistsContainer");
          assignedPlaylistsContainer.empty();

          user.playlists.forEach((playlist) => {
            assignedPlaylistsContainer.append(`
              <div class="playlist-item" data-id="${playlist._id}">
                <span>${playlist.title}</span>
                <button type="button" class="btn btn-danger btn-sm remove-playlist-btn">Remove</button>
              </div>
            `);
          });

          $("#assignPlaylistModal").modal("show");

          $.ajax({
            url: `/api/admin/playlists`,
            method: "GET",
            success: function (response) {
              const availablePlaylists = response.playlists;
              const availablePlaylistsDropdown = $("#availablePlaylists");
              availablePlaylistsDropdown.empty();

              availablePlaylists.forEach((playlist) => {
                availablePlaylistsDropdown.append(`
                  <option value="${playlist._id}">${playlist.title}</option>
                `);
              });
            },
            error: function () {
              alert("Failed to load available playlists");
            },
          });
        },
        error: function () {
          alert("Failed to load user details");
        },
      });

      // Handle assigning a new playlist
      $("#assignPlaylistBtn")
        .off("click")
        .on("click", function () {
          const playlistId = $("#availablePlaylists").val();
          $.ajax({
            url: `/api/admin/user/${userId}/playlists`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ playlistId }),
            success: function () {
              // Reload the playlists
              $.ajax({
                url: `/api/admin/user/${userId}/playlists`,
                method: "GET",
                success: function (response) {
                  const user = response.user;
                  const assignedPlaylistsContainer = $(
                    "#assignedPlaylistsContainer"
                  );
                  assignedPlaylistsContainer.empty();

                  user.playlists.forEach((playlist) => {
                    assignedPlaylistsContainer.append(`
                      <div class="playlist-item" data-id="${playlist._id}">
                        <span>${playlist.title}</span>
                        <button type="button" class="btn btn-danger btn-sm remove-playlist-btn">Remove</button>
                      </div>
                    `);
                  });
                },
                error: function () {
                  alert("Failed to reload user playlists");
                },
              });
            },
            error: function () {
              alert("Failed to assign playlist");
            },
          });
        });

      // Handle removing a playlist
      $("#assignedPlaylistsContainer")
        .off("click", ".remove-playlist-btn")
        .on("click", ".remove-playlist-btn", function () {
          const playlistId = $(this).closest(".playlist-item").data("id");
          $.ajax({
            url: `/api/admin/user/${userId}/playlists/${playlistId}`,
            method: "DELETE",
            success: function () {
              // Reload the playlists
              $.ajax({
                url: `/api/admin/user/${userId}/playlists`,
                method: "GET",
                success: function (response) {
                  const user = response.user;
                  const assignedPlaylistsContainer = $(
                    "#assignedPlaylistsContainer"
                  );
                  assignedPlaylistsContainer.empty();

                  user.playlists.forEach((playlist) => {
                    assignedPlaylistsContainer.append(`
                      <div class="playlist-item" data-id="${playlist._id}">
                        <span>${playlist.title}</span>
                        <button type="button" class="btn btn-danger btn-sm remove-playlist-btn">Remove</button>
                      </div>
                    `);
                  });
                },
                error: function () {
                  alert("Failed to reload user playlists");
                },
              });
            },
            error: function () {
              alert("Failed to remove playlist");
            },
          });
        });
    });

    // Edit Playlist Functionality
    $(document).on("click", ".edit-playlist-btn", function () {
      const playlistId = $(this).data("id");
      $.ajax({
        url: `/api/admin/playlist/${playlistId}`,
        method: "GET",
        success: function (response) {
          const playlist = response.playlist;
          $("#editPlaylistTitle").val(playlist.title);
          const videoInputsContainer = $("#editVideoInputsContainer");
          videoInputsContainer.empty();

          playlist.videos.forEach((video, index) => {
            videoInputsContainer.append(`
                            <div class="form-group video-input-group" data-index="${index}">
                                <label for="videoTitle_${index}">Video Title</label>
                                <input type="text" id="videoTitle_${index}" class="form-control" value="${video.title}" required>
                                <label for="videoUrl_${index}">Video URL</label>
                                <input type="text" id="videoUrl_${index}" class="form-control" value="${video.url}" required>
                                <button type="button" class="btn btn-danger remove-video-btn">Delete Video</button>
                            </div>
                        `);
          });

          $("#editPlaylistModal").modal("show");
        },
        error: function () {
          alert("Failed to load playlist details");
        },
      });

      $("#addEditVideoField")
        .off("click")
        .on("click", function () {
          const index = $(
            "#editVideoInputsContainer .video-input-group"
          ).length;
          $("#editVideoInputsContainer").append(`
                    <div class="form-group video-input-group" data-index="${index}">
                        <label for="videoTitle_${index}">Video Title</label>
                        <input type="text" id="videoTitle_${index}" class="form-control" required>
                        <label for="videoUrl_${index}">Video URL</label>
                        <input type="text" id="videoUrl_${index}" class="form-control" required>
                        <button type="button" class="btn btn-danger remove-video-btn">Delete Video</button>
                    </div>
                `);
        });

      $("#editVideoInputsContainer")
        .off("click", ".remove-video-btn")
        .on("click", ".remove-video-btn", function () {
          $(this).closest(".video-input-group").remove();
        });

      $("#editPlaylistForm")
        .off("submit")
        .on("submit", function (e) {
          e.preventDefault();
          const title = $("#editPlaylistTitle").val();
          const videos = [];

          $("#editVideoInputsContainer .video-input-group").each(function () {
            const videoTitle = $(this).find('input[id^="videoTitle_"]').val();
            const videoUrl = $(this).find('input[id^="videoUrl_"]').val();
            if (videoTitle && videoUrl) {
              videos.push({ title: videoTitle, url: videoUrl });
            }
          });

          if (videos.length === 0) {
            alert("Please add at least one video.");
            return;
          }

          $.ajax({
            url: `/api/admin/playlist/${playlistId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ title, videos }),
            success: function () {
              $("#editPlaylistModal").modal("hide");
              loadPlaylists(); // Reload playlists after a successful update
            },
            error: function () {
              alert("Failed to update playlist");
            },
          });
        });
    });

    // Delete Playlist Functionality
    $(document).on("click", ".delete-playlist-btn", function () {
      const playlistId = $(this).data("id");
      if (confirm("Are you sure you want to delete this playlist?")) {
        $.ajax({
          url: `/api/admin/playlist/${playlistId}`,
          method: "DELETE",
          success: function () {
            loadPlaylists();
          },
          error: function () {
            alert("Failed to delete playlist");
          },
        });
      }
    });
  }
});
