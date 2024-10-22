import React from "react";
import LOGO from "../assets/images/logo.svg";
import ProfileInfo from "./Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import SearchBar from "./input/SearchBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchMemories,
  handleClearSearch,
}) => {
  const navigate = useNavigate();
  const isToken = Cookies.get("token");

  const onLogout = () => {
    Cookies.remove("token", { path: "/" });
    navigate("/login");
  };

  const handleSearch = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast.error("Please enter some text to search");
      return;
    }
    onSearchMemories(trimmedQuery);
  };

  const onClearSearch = () => {
    handleClearSearch();
    setSearchQuery("");
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <img src={LOGO} alt="Travel Memories" className="h-9" />
      {isToken && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              setSearchQuery(target.value);
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          {userInfo && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
        </>
      )}
    </div>
  );
};
export default Navbar;
