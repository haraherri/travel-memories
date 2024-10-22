import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/input/PasswordInput";
import { validateInput } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !username) {
      setError("Please enter fullname and username");
      return;
    }

    const { isValid } = validateInput(email);
    if (!isValid) {
      setError("Please enter a valid email address!");
      return;
    }

    if (!password) {
      setError("Please enter the password!");
      return;
    }

    setError("");
    try {
      const response = await axiosInstance.post("api/auth/create-account", {
        fullName: fullName,
        username: username,
        email: email,
        password: password,
      });

      if (response.data && response.data._id) {
        toast.success("Sign up successful! Redirecting to login page...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Signup was not successful. Please try again.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again";
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          errorMessage;
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <ToastContainer />
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[98vh] flex items-end bg-signup-bg-img bg-cover bg-center rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[50px] ">
              Join the <br /> Adventure
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4">
              Create an account to start documenting your travels and preserving
              your memories in your personal travel journal.
            </p>
          </div>
        </div>
        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl font-semibold mb-2">Register</h4>
            <input
              type="text"
              placeholder="Full Name"
              className="input-box"
              value={fullName}
              onChange={({ target }) => {
                setFullName(target.value);
              }}
            />
            <input
              type="text"
              placeholder="Username"
              className="input-box"
              value={username}
              onChange={({ target }) => {
                setUsername(target.value);
              }}
            />
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => {
                setEmail(target.value);
              }}
            />
            <PasswordInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="btn-primary">
              REGISTER
            </button>
            <p className="text-xs text-slate-500 text-center my-4">Or</p>
            <button
              type="submit"
              className="btn-primary btn-light"
              onClick={() => navigate("/login")}
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
