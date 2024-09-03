const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  const { userId, password, deviceFingerprint, deviceSpecs } = req.body;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Handle device fingerprinting for students
    if (user.role === "student") {
      const deviceExists = user.devices.find(
        (device) => device.fingerprint === deviceFingerprint
      );

      if (!deviceExists) {
        if (user.devices.length >= user.maxComputers) {
          return res
            .status(403)
            .json({ message: "Maximum device limit reached for this account" });
        }
        // Register the new device with specs
        user.devices.push({
          fingerprint: deviceFingerprint,
          specs: deviceSpecs,
        });
        await user.save();
      }
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true });

    if (user.role === "admin") {
      res.status(200).json({ success: true, redirectTo: "/admin.html" });
    } else {
      res.status(200).json({ success: true, redirectTo: "/student.html" });
    }
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res
    .cookie("token", "", { httpOnly: true, expires: new Date(0) })
    .status(200)
    .json({ success: true });
};
