import React, { useState } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import DateSelector from "../../components/input/DateSelector";
import ImageSelector from "../../components/input/ImageSelector";
import TagInput from "../../components/input/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const AddEditTravels = ({ memoriesInfo, type, onClose, getAllTravels }) => {
  const [title, setTitle] = useState(memoriesInfo?.title || "");
  const [images, setImages] = useState(memoriesInfo?.image || []);
  const [story, setStory] = useState(memoriesInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    memoriesInfo?.visitedLocation || []
  );
  const [visitedDate, setVisitedDate] = useState(
    memoriesInfo?.visitedDate || null
  );

  const [error, setError] = useState("");

  const addNewTravelMemory = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("story", story);
      visitedLocation.forEach((location) => {
        formData.append("visitedLocation[]", location);
      });
      formData.append(
        "visitedDate",
        visitedDate
          ? moment(visitedDate).valueOf().toString()
          : moment().valueOf().toString()
      );

      if (images) {
        if (Array.isArray(images)) {
          images.forEach((img, index) => {
            formData.append("images", img);
          });
        } else {
          formData.append("images", image);
        }
      }

      const response = await axiosInstance.post(
        "api/travel/add-travel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.travel) {
        toast.success("Travel memory added successfully!");
        getAllTravels();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.error);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Error adding new travel memory:", error);
    }
  };

  const updateTravelMemory = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("story", story);
      visitedLocation.forEach((location) => {
        formData.append("visitedLocation[]", location);
      });
      formData.append(
        "visitedDate",
        visitedDate
          ? moment(visitedDate).valueOf().toString()
          : moment().valueOf().toString()
      );

      if (images) {
        const newImages = images.filter((img) => img instanceof File);
        newImages.forEach((img) => {
          formData.append("images", img);
        });
      }

      const originalImages = memoriesInfo?.image || [];
      const currentImages = images.filter((img) => typeof img === "string");
      const deletedImages = originalImages.filter(
        (img) => !currentImages.includes(img)
      );

      if (deletedImages.length > 0) {
        deletedImages.forEach((img) => {
          formData.append("deleteImages[]", img);
        });
      }

      const response = await axiosInstance.put(
        `api/travel/update-travel/${memoriesInfo._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.travel) {
        toast.success("Travel memory updated successfully!");
        getAllTravels();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error);
      } else {
        setError("Internal Server Error!");
      }
      console.error("Error updating travel memory:", error);
    }
  };

  const handleAddOrUpdateClick = () => {
    if (!title) {
      setError("Please Enter the title!");
      return;
    }
    if (!story) {
      setError("Please Enter the story!");
      return;
    }
    setError("");

    if (type === "edit") {
      updateTravelMemory();
    } else {
      addNewTravelMemory();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-medium text-slate-700">
          {type === "add" ? "Add Memories" : "Update Memories"}
        </h5>

        <div>
          <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
            {type === "add" ? (
              <button className="btn-small" onClick={handleAddOrUpdateClick}>
                <MdAdd className="text-lg" /> ADD STORY
              </button>
            ) : (
              <>
                <button className="btn-small" onClick={handleAddOrUpdateClick}>
                  <MdUpdate className="text-lg" /> UPDATE MEMORY
                </button>
              </>
            )}

            <button className="" onClick={onClose}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 pt-4">
        <label className="input-label">TITLE</label>
        <input
          type="text"
          className="text-2xl text-slate-950 outline-none"
          placeholder="A Day at the Paris"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
        <div className="my-3">
          <DateSelector date={visitedDate} setDate={setVisitedDate} />
        </div>
        <ImageSelector images={images} setImages={setImages} />
        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label">STORY</label>
          <textarea
            type="text"
            className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
            placeholder="Your Story"
            rows={10}
            value={story}
            onChange={({ target }) => setStory(target.value)}
          />
        </div>
        <div className="pt-3">
          <label className="input-label">VISITED LOCATIONS</label>
          <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
        </div>
      </div>
    </div>
  );
};

export default AddEditTravels;
