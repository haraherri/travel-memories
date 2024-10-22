import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/input/PasswordInput";
import { validateInput } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier) {
      setError("Please enter an email or username!");
      return;
    }

    const { isValid, type } = validateInput(identifier);
    if (!isValid) {
      setError("Please enter a valid email or username!");
      return;
    }

    if (!password) {
      setError("Please enter the password!");
      return;
    }

    setError("");
    try {
      // Gửi request với đúng trường tương ứng
      const payload = {
        password,
        [type]: identifier, // Sẽ tạo email: identifier hoặc username: identifier
      };

      const response = await axiosInstance.post("api/auth/login", payload);

      if (response.data && response.data.user) {
        navigate("/");
      }
    } catch (error) {
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (error.response && error.response.data) {
        setError(
          error.response.data.error ||
            error.response.data.message ||
            "An unexpected error occurred. Please try again"
        );
      } else {
        setError("An unexpected error occurred. Please try again");
      }
    }
  };

  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[98vh] flex items-end bg-login-bg-img bg-cover bg-center rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[50px] ">
              Capture your <br /> Journeys
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4">
              Record your travel expierences and memories in your personal
              travel journal.
            </p>
          </div>
        </div>
        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold mb-2">Login</h4>
            <input
              type="text"
              placeholder="Email or Username"
              className="input-box"
              value={identifier}
              onChange={({ target }) => setIdentifier(target.value)}
            />
            <PasswordInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="btn-primary">
              LOGIN
            </button>
            <p className="text-xs text-slate-500 text-center my-4">Or</p>
            <button
              type="submit"
              className="btn-primary btn-light"
              onClick={() => navigate("/signup")}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
