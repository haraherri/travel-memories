const { CustomError } = require("../middlewares/error");
const Travel = require("../models/travel.model");
const User = require("../models/user.model");
const path = require("path");
const fs = require("fs").promises;

const projectRoot = path.resolve(__dirname, "..");
const uploadDir = path.join(projectRoot, "uploads");

const generateFileUrl = (filename) => {
  return process.env.URL + `/uploads/${filename}`;
};

const addTravelController = async (req, res, next) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const userId = req.userId;
  const files = req.files || [];

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    let imageUrls = [];
    if (files.length > 0) {
      imageUrls = files.map((file) => generateFileUrl(file.filename));
    }

    const parsedVisitedDate = new Date(parseInt(visitedDate));
    if (isNaN(parsedVisitedDate.getTime())) {
      throw new CustomError("Invalid visited date", 400);
    }

    const newTravel = new Travel({
      user: userId,
      title,
      story,
      image: imageUrls,
      visitedLocation,
      visitedDate: parsedVisitedDate,
      imageUrl,
    });

    await newTravel.save();

    return res.status(201).json({
      message: "New Travel created successfully!",
      travel: newTravel,
    });
  } catch (error) {
    next(error);
  }
};

const getUserTravelsController = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(`User not found!`, 404);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTravels = await Travel.countDocuments({ user: userId });
    const userTravels = await Travel.find({ user: userId })
      .sort({ isFavorite: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalTravels / limit);

    const paginationInfo = {
      currentPage: page,
      travelsPerPage: limit,
      totalTravels,
      totalPages,
    };

    if (page < totalPages) {
      paginationInfo.nextPage = page + 1;
    }
    if (page > 1) {
      paginationInfo.previousPage = page - 1;
    }

    res.status(200).json({
      travels: userTravels,
      pagination: paginationInfo,
    });
  } catch (error) {
    next(error);
  }
};

const updateTravelController = async (req, res, next) => {
  const { travelId } = req.params;
  const {
    title,
    story,
    visitedLocation,
    visitedDate,
    isFavorite,
    deleteImages = [],
  } = req.body;
  const { files = [] } = req;

  try {
    const travel = await Travel.findById(travelId);
    if (!travel) {
      throw new CustomError("Travel not found!", 404);
    }

    await handleImageDeletion(travel, deleteImages);
    await handleImageAddition(travel, files);

    const updatedFields = {
      title: title || travel.title,
      story: story || travel.story,
      isFavorite,
      visitedLocation: visitedLocation || travel.visitedLocation,
      visitedDate: visitedDate
        ? new Date(parseInt(visitedDate))
        : travel.visitedDate,
      image: travel.image,
    };

    const updatedTravel = await Travel.findByIdAndUpdate(
      travelId,
      updatedFields,
      { new: true }
    );

    return res.status(200).json({
      message: "Travel updated successfully!",
      travel: updatedTravel,
    });
  } catch (error) {
    next(error);
  }
};

const handleImageDeletion = async (travel, deleteImages) => {
  const imagesToDelete = Array.isArray(deleteImages)
    ? deleteImages
    : [deleteImages];

  for (const imageUrl of imagesToDelete) {
    const deleted = await deleteImage(imageUrl);
    if (deleted) {
      travel.image = travel.image.filter((img) => img !== imageUrl);
    }
  }
};

const handleImageAddition = async (travel, files) => {
  if (files.length > 0) {
    const newImageUrls = files.map((file) => generateFileUrl(file.filename));
    travel.image.push(...newImageUrls);
  }
};

const deleteTravelController = async (req, res, next) => {
  const { travelId } = req.params;
  const userId = req.userId;
  try {
    const travel = await Travel.findById(travelId);
    if (!travel) {
      throw new CustomError("Travel not found!", 404);
    }

    if (travel.user.toString() !== userId) {
      throw new CustomError(
        "You do not have permission to delete this travel!",
        403
      );
    }
    const deletionPromises = travel.image.map(deleteImage);

    await Promise.all(deletionPromises);
    await travel.deleteOne();

    res
      .status(200)
      .json({ message: "Travel and associated images deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (imageUrl) => {
  try {
    const imageName = imageUrl.split("/uploads/")[1];
    const filePath = path.join(uploadDir, imageName);

    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting image ${imageUrl}:`, error);
    return false;
  }
};

const searchTravelController = async (req, res, next) => {
  const { q, page = 1, limit = 10, sort = "createdAt" } = req.query;
  const skip = (page - 1) * limit;
  const userId = req.userId;

  try {
    if (!q) {
      throw new CustomError("Search query is required", 400);
    }

    const searchQuery = {
      userId: userId,
      $or: [
        { title: { $regex: new RegExp(q, "i") } },
        { story: { $regex: new RegExp(q, "i") } },
        { visitedLocation: { $regex: new RegExp(q, "i") } },
      ],
    };

    const sortOption = {};
    sortOption[sort] = -1;

    const [travels, total] = await Promise.all([
      Travel.find(searchQuery)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select("title story visitedLocation visitedDate image isFavorite"),
      Travel.countDocuments(searchQuery),
    ]);

    if (!travels.length) {
      throw new CustomError(
        "No travel memories found matching your search",
        404
      );
    }

    res.status(200).json({
      travels,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    });
  } catch (error) {
    next(error);
  }
};
const filterTravelByDateRange = async (req, res, next) => {
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const userId = req.userId;

  try {
    if (!startDate || !endDate) {
      throw new CustomError("Both start date and end date are required!", 400);
    }
    const startDateTime = new Date(parseInt(startDate));
    const endDateTime = new Date(parseInt(endDate));

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new CustomError("Invalid date format. Please use miliseconds", 400);
    }

    const dateFilter = {
      userId: userId,
      visitedDate: {
        $gte: startDateTime,
        $lte: endDateTime,
      },
    };

    const travels = await Travel.find(dateFilter)
      .sort({ isFavorite: -1, visitedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("title story visitedLocation visitedDate image isFavorite")
      .lean();

    const total = await Travel.countDocuments(dateFilter);

    res.status(200).json({
      travels,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    });
  } catch (error) {
    console.error("Filter by date range error:", error);
    next(error);
  }
};

module.exports = {
  addTravelController,
  getUserTravelsController,
  updateTravelController,
  deleteTravelController,
  searchTravelController,
  filterTravelByDateRange,
};
