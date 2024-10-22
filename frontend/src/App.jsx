import React, { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import axiosInstance from "./utils/axiosInstance";

const Root = () => {
  const [authState, setAuthState] = useState({
    isChecking: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/api/auth/");
        setAuthState({ isChecking: false, isAuthenticated: true });
      } catch (error) {
        setAuthState({ isChecking: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  if (authState.isChecking) {
    return null;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Home />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
