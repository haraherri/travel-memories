import moment from "moment";
import React, { useEffect, useState } from "react";
import { GrMapLocation } from "react-icons/gr";
import { MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const ViewTravelMemories = ({
  memoriesInfo,
  onClose,
  onEditClick,
  onDeleteClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const images = Array.isArray(memoriesInfo?.image)
    ? memoriesInfo.image
    : [memoriesInfo?.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
          <button className="btn-small" onClick={onEditClick}>
            <MdUpdate className="text-lg" /> UPDATE STORY
          </button>
          <button className="btn-small btn-delete" onClick={onDeleteClick}>
            <MdDeleteOutline className="text-lg" /> Delete
          </button>
          <button onClick={onClose}>
            <MdClose className="text-xl text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 py-4">
        <h1 className="text-2xl text-slate-950">{memoriesInfo?.title}</h1>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {memoriesInfo &&
              moment(memoriesInfo.visitedDate).format("Do MMM YYYY")}
          </span>
          <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded px-2 py-1">
            <GrMapLocation className="text-xs" />
            {memoriesInfo?.visitedLocation.map((item, index) =>
              memoriesInfo.visitedLocation.length === index + 1
                ? `${item}`
                : `${item}, `
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-[300px] overflow-hidden rounded-lg relative">
          <img
            src={images[currentImageIndex]}
            alt={`Travel memory ${currentImageIndex + 1}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <IoIosArrowBack size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                <IoIosArrowForward size={20} />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentImageIndex === index ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">
          {memoriesInfo?.story}
        </p>
      </div>
    </div>
  );
};

export default ViewTravelMemories;
