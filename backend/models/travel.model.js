const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    visitedLocation: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: [
      {
        type: String,
        required: false,
      },
    ],
    visitedDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Travel = mongoose.model("Travel", travelSchema);

module.exports = Travel;
