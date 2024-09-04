const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  addUser,
  updateUser,
  deleteUserDevice,
  getUserDevices,
  getUserWithPlaylists,
  assignPlaylistToUser,
  removePlaylistFromUser,
  getUser,
  deleteUser,
  getAllUsers,
  getPlaylist,
  updatePlaylist,
  addPlaylist,
  deletePlaylist,
  //   removePlaylist,
  getAllPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/user", protect, admin, addUser);
router.delete("/user/:id", protect, admin, deleteUser);
router.get("/users", protect, admin, getAllUsers);
router.put("/user/:id", protect, admin, updateUser);
router.get("/user/:id", protect, admin, getUser);
router.get("/user/:id/playlists", protect, admin, getUserWithPlaylists);
router.post("/user/:id/playlists", protect, admin, assignPlaylistToUser);
router.delete(
  "/user/:id/playlists/:playlistId",
  protect,
  admin,
  removePlaylistFromUser
);
router.get("/user/:id/devices", protect, admin, getUserDevices);
router.delete("/user/:id/devices/:device", protect, admin, deleteUserDevice);

router.post("/playlist", protect, admin, addPlaylist);
// router.delete("/playlist/:id", protect, admin, removePlaylist);
router.delete("/playlist/:id", protect, admin, deletePlaylist);

router.post("/playlist/video", protect, admin, addVideoToPlaylist);
router.delete("/playlist/video/:id", protect, admin, removeVideoFromPlaylist);
router.get("/playlists", protect, admin, getAllPlaylists);
router.get("/playlist/:id", protect, admin, getPlaylist);
router.put("/playlist/:id", protect, admin, updatePlaylist);

module.exports = router;
