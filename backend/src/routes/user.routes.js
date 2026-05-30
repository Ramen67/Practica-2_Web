const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  getProfile,
  updateProfile,
  getOrderHistory,
} = require("../controllers/user.controller");

router.get("/profile", verifyToken, getProfile);
router.put("/update-profile", verifyToken, updateProfile);
router.get("/order-history", verifyToken, getOrderHistory);

module.exports = router;
