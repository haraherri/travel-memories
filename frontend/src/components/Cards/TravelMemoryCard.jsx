import React from "react";
import moment from "moment";
import { FaHeart } from "react-icons/fa6";
import { GrMapLocation } from "react-icons/gr";

const TravelMemoryCard = ({
  image,
  title,
  story,
  date,
  visitedLocation,
  isFavorite,
  onFavoriteClick,
  onClick,
}) => {
  const truncateText = (text, maxLength) => {
    if (text?.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg hover:shadow-slate-200 transition-all ease-in-out relative cursor-pointer h-[400px] flex flex-col">
      <div className="relative h-56">
        <img
          src={image[0]}
          alt={title}
          className="w-full h-full object-cover"
          onClick={onClick}
        />
        <button
          className="w-10 h-10 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 absolute top-4 right-4 transition-all hover:bg-white/60"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick();
          }}
        >
          <FaHeart
            className={`transition-colors ${
              isFavorite ? "text-red-500" : "text-white"
            }`}
            size={20}
          />
        </button>
      </div>

      <div
        className="p-4 flex flex-col flex-1 justify-between"
        onClick={onClick}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <h6 className="text-sm font-semibold line-clamp-1">{title}</h6>
              <span className="text-xs text-slate-500">
                {date ? moment(date).format("Do MMM YYYY") : "-"}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600 line-clamp-3">
            {truncateText(story, 60)}
          </p>
        </div>

        <div className="flex">
          <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-100 rounded-full mt-3 px-3 py-1.5">
            <GrMapLocation size={16} className="flex-shrink-0" />
            <span className="truncate max-w-[245px]">
              {visitedLocation.join(", ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelMemoryCard;
