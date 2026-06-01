const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  getProfile,
  updateProfile,
  getOrderHistory,
  changePassword,
} = require("../controllers/user.controller");

router.get("/profile", verifyToken, getProfile);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.get("/order-history", verifyToken, getOrderHistory);

module.exports = router;
