const express = require("express");

const verifyToken = require("../middlewares/verifyToken");
const {
  addTravelController,
  getUserTravelsController,
  updateTravelController,
  deleteTravelController,
  searchTravelController,
  filterTravelByDateRange,
} = require("../controllers/travelController");
const upload = require("../middlewares/upload");
const router = express.Router();

router.post(
  "/add-travel",
  verifyToken,
  upload.array("images", 5),
  addTravelController
);
router.put(
  "/update-travel/:travelId",
  verifyToken,
  upload.array("images", 5),
  updateTravelController
);
router.delete("/delete-travel/:travelId", verifyToken, deleteTravelController);
router.get("/get-all-travels", verifyToken, getUserTravelsController);
router.get("/search", verifyToken, searchTravelController);
router.get("/filter-by-date", verifyToken, filterTravelByDateRange);
module.exports = router;
