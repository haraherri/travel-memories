import React, { useEffect, useRef, useState } from "react";
import { FaRegFileImage } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector = ({ images, setImages }) => {
  const inputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
    e.target.value = null;
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  useEffect(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const urls = images.map((image) => {
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
      return image;
    });

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative aspect-video">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
            <button
              className="btn-small btn-delete absolute top-2 right-2"
              onClick={() => handleRemoveImage(index)}
            >
              <MdDeleteOutline className="text-lg" />
            </button>
          </div>
        ))}

        {images.length < 5 && (
          <button
            className="w-full aspect-video flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50"
            onClick={onChooseFile}
          >
            <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border border-cyan-100">
              <FaRegFileImage className="text-xl text-cyan-500" />
            </div>
            <p className="text-sm text-slate-500">
              Browse images ({5 - images.length} remaining)
            </p>
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
export default ImageSelector;
