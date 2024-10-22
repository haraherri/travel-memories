import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import TravelMemoryCard from "../../components/Cards/TravelMemoryCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import AddEditTravels from "./AddEditTravels";
import ViewTravelMemories from "./ViewTravelMemories";
import EmptyCard from "../../components/Cards/EmptyCard";
import EmptyImg from "../../assets/images/add.svg";
import { DayPicker } from "react-day-picker";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allTravels, setAllTravels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    travelsPerPage: 6,
    totalTravels: 0,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
  });

  const [openCRUDModal, setOpenCRUDModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("api/auth/get-user");
      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        Cookies.remove("token", { path: "/" });
        navigate("/login");
      }
    }
  };

  const getAllTravels = async (page = 1) => {
    try {
      const response = await axiosInstance.get(
        `api/travel/get-all-travels?page=${page}&limit=6`
      );
      if (response.data) {
        setAllTravels(response.data.travels);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = async (newPage) => {
    try {
      let response;

      if (isSearching) {
        if (dateRange.from && dateRange.to) {
          const startDate = dateRange.from.getTime();
          const endDate = dateRange.to.getTime();

          response = await axiosInstance.get(
            `api/travel/filter-by-date/?startDate=${startDate}&endDate=${endDate}&page=${newPage}&limit=6`
          );
        } else if (currentSearchQuery) {
          response = await axiosInstance.get(
            `api/travel/search?q=${currentSearchQuery}&page=${newPage}&limit=6`
          );
        } else {
          setIsSearching(false);
          return getAllTravels(newPage);
        }
      } else {
        return getAllTravels(newPage);
      }
      if (response?.data) {
        setAllTravels(response.data.travels);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalTravels: response.data.totalResults,
          travelsPerPage: 6,
          nextPage:
            response.data.currentPage < response.data.totalPages
              ? response.data.currentPage + 1
              : null,
          previousPage:
            response.data.currentPage > 1
              ? response.data.currentPage - 1
              : null,
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Internal Server Error!");
      }
      console.error("Page change error:", error);
    }
  };
  const handleEdit = (data) => {
    setOpenCRUDModal({ isShown: true, type: "edit", data: data });
  };

  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  const handleDeleteTravel = async (travelData) => {
    try {
      const response = await axiosInstance.delete(
        `/api/travel/delete-travel/${travelData._id}`
      );

      if (response.status === 200) {
        toast.success("Travel Memory deleted successfully!");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
      }
      const isLastItemOnPage =
        allTravels.length === 1 && pagination.currentPage > 1;

      if (isLastItemOnPage) {
        await getAllTravels(pagination.currentPage - 1);
      } else {
        await getAllTravels(pagination.currentPage);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Internal Server Error!");
      }
      console.error("Error deleting travel:", error);
    }
  };

  const onDeleteClick = (travelData) => {
    if (window.confirm("Are you sure you want to delete this travel memory?")) {
      handleDeleteTravel(travelData);
    }
  };
  const updateIsFavorite = async (travelData) => {
    const travelId = travelData._id;
    try {
      const response = await axiosInstance.put(
        `/api/travel/update-travel/${travelId}`,
        {
          isFavorite: !travelData.isFavorite,
        }
      );
      if (response.data && response.data.travel) {
        toast.success("Memories updated successfully!");
        await getAllTravels(pagination.currentPage);
      }
    } catch (error) {
      console.error("An unexpected error occurred. Please try again.", error);
    }
  };
  const onSearchMemories = async (query) => {
    try {
      const response = await axiosInstance.get(
        `api/travel/search?q=${query}&page=1&limit=6`
      );

      if (response.data) {
        setIsSearching(true);
        setCurrentSearchQuery(query);
        setFilterType("search");
        setAllTravels(response.data.travels);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalTravels: response.data.totalResults,
          travelsPerPage: 6,
          nextPage:
            response.data.currentPage < response.data.totalPages
              ? response.data.currentPage + 1
              : null,
          previousPage:
            response.data.currentPage > 1
              ? response.data.currentPage - 1
              : null,
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Internal Server Error!");
      }
    }
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setCurrentSearchQuery("");
    setDateRange({ from: null, to: null });
    setFilterType(null);
    getAllTravels();
  };
  const filterMemoriesByDate = async (range) => {
    if (!range?.from || !range?.to) {
      toast.error("Both start date and end date are required!");
      return;
    }

    try {
      const startDate = range.from.getTime();
      const endDate = range.to.getTime();

      const response = await axiosInstance.get(
        `api/travel/filter-by-date/?startDate=${startDate}&endDate=${endDate}&page=1&limit=6`
      );

      if (response.data) {
        setIsSearching(true);
        setAllTravels(response.data.travels);
        setFilterType("date");
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalTravels: response.data.totalResults,
          travelsPerPage: 6,
          nextPage:
            response.data.currentPage < response.data.totalPages
              ? response.data.currentPage + 1
              : null,
          previousPage:
            response.data.currentPage > 1
              ? response.data.currentPage - 1
              : null,
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Internal Server Error!");
      }
      console.error("Filter error:", error);
    }
  };

  const handleDayClick = (range) => {
    setDateRange(range);

    if (!range || (!range.from && !range.to)) {
      setIsSearching(false);
      getAllTravels(1);
      return;
    }

    if (range.from && range.to) {
      filterMemoriesByDate(range);
    }
  };
  useEffect(() => {
    getUserInfo();
    getAllTravels();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchMemories={onSearchMemories}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50">
        <div className="flex flex-col lg:flex-row gap-7">
          <div className="flex-1">
            <div
              className={`transition-all duration-300 ${
                isSearching ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
              }`}
            >
              <FilterInfoTitle
                filterType={filterType}
                filterDates={dateRange}
                onClear={handleClearSearch}
              />
            </div>
            {allTravels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allTravels.map((item) => (
                    <div
                      key={item._id}
                      className="transform hover:scale-105 transition-transform duration-300"
                    >
                      <TravelMemoryCard
                        image={item.image}
                        title={item.title}
                        story={item.story}
                        date={item.visitedDate}
                        visitedLocation={item.visitedLocation}
                        isFavorite={item.isFavorite}
                        onClick={() => handleViewStory(item)}
                        onFavoriteClick={() => updateIsFavorite(item)}
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    {pagination.previousPage && (
                      <button
                        className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        onClick={() =>
                          handlePageChange(pagination.previousPage)
                        }
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Page numbers */}
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                          pagination.currentPage === pageNumber
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-blue-500"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    {pagination.nextPage && (
                      <button
                        className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        onClick={() => handlePageChange(pagination.nextPage)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Page Info */}
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) *
                        pagination.travelsPerPage +
                        1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.travelsPerPage,
                        pagination.totalTravels
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalTravels}
                    </span>{" "}
                    travels
                  </div>
                </div>
              </>
            ) : (
              <EmptyCard
                imgSrc={EmptyImg}
                message={`Start creating your first Travel Memory! 
                  Click the 'Add' Button to jot down your thoughts, ideas...Let's get started`}
              />
            )}
          </div>
          <div className="w-[340px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                  captionLayout="dropdown-buttons"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openCRUDModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravels
          type={openCRUDModal.type}
          memoriesInfo={openCRUDModal.data}
          onClose={() => {
            setOpenCRUDModal({ isShown: false, type: "add", data: null });
            getAllTravels(pagination.currentPage); // Refresh current page after add/edit
          }}
          getAllTravels={getAllTravels}
        />
      </Modal>

      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelMemories
          memoriesInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({
              ...prevState,
              isShown: false,
            }));
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({
              ...prevState,
              isShown: false,
            }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => onDeleteClick(openViewModal.data)}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenCRUDModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />
    </>
  );
};

export default Home;
