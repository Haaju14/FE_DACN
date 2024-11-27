import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup"; // For validation
import { useDispatch } from "react-redux";
import { login } from "../../redux/reducers/userReducer"; // Import action login
import useRoute from "../../hook/useRoute"; // Custom hook to manage routing
import { BASE_URL } from "../../util/fetchfromAPI";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { navigate } = useRoute();

  // Toggle visibility of password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (credentialResponse.credential) {
      try {
        const response = await axios.post(`${BASE_URL}/google-login`, {
          token: credentialResponse.credential,
        });

        if (response.status === 200) {
          const token = response.data.content.token; // JWT token từ server
          const user = response.data.content.user; // Thông tin user từ server

          // Lưu thông tin user và token vào Redux
          dispatch(login({ user, token }));

          // Lưu token vào localStorage
          localStorage.setItem("token", token);

          // Điều hướng dựa trên vai trò của user
          if (user.Role === "admin" || user.Role === "giangvien") {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }

          window.location.reload();
        }
      } catch (error) {
        console.error("Google login failed:", error);
        setMessage("Google login failed. Please try again.");
      }
    }
  };

  const handleGoogleLoginError = () => {
    setMessage("Google login failed. Please try again.");
  };

  // Formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      Email: "",
      MatKhau: "",
    },
    validationSchema: Yup.object({
      Email: Yup.string().email("Invalid email address").required("Required"),
      MatKhau: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(`${BASE_URL}/login`, {
          Email: values.Email,
          MatKhau: values.MatKhau,
        });

        if (response.status === 200) {
          const token = response.data.content.token;
          const user = response.data.content.user;

          dispatch(login({ user, token }));
          localStorage.setItem("token", token);
          if (user.Role === "admin" || user.Role === "giangvien") {
            navigate("/");
          } else {
            setMessage("Login successful!");
            navigate("/");
          }

          window.location.reload();
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setMessage(
              error.response.data.message || "Login failed with server error"
            );
          } else if (error.request) {
            setMessage("No response from server. Please try again later.");
          }
        } else {
          setMessage(
            "An unexpected error occurred: " + (error as Error).message
          );
        }
      }
    },
  });

  // Log for specific field changes
  useEffect(() => {
    console.log("Email value changed:", formik.values.Email);
  }, [formik.values.Email]);

  useEffect(() => {
    console.log("MatKhau value changed:", formik.values.MatKhau);
  }, [formik.values.MatKhau]);

  return (
    <GoogleOAuthProvider clientId="570267955759-aclm1247o0pncpdj9nihpev3q55odurh.apps.googleusercontent.com">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={formik.handleSubmit}>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="loginEmail">Email</label>
            <input
              type="email"
              className="form-control"
              id="loginEmail"
              placeholder="Enter email"
              name="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.Email}
            />
            {formik.touched.Email && formik.errors.Email && (
              <div className="text-danger">{formik.errors.Email}</div>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="loginPassword"
                placeholder="Password"
                name="MatKhau"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.MatKhau}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  <i
                    className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                  ></i>
                </button>
              </div>
            </div>
            {formik.touched.MatKhau && formik.errors.MatKhau && (
              <div className="text-danger">{formik.errors.MatKhau}</div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary">
            Login
          </button>

          {/* Google Login Button */}
          <div className="mt-3">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          {/* Error or Success Message */}
          {message && <div className="mt-3">{message}</div>}
        </form>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
