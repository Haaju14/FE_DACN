import React, { useState } from "react";
import axios from "axios";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { BASE_URL } from "../../util/fetchfromAPI";
import { message } from "antd";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    TenDangNhap: "",
    Email: "",
    MatKhau: "",
    HoTen: "",
    GioiTinh: true, // Mặc định là nam
    SDT: "",
    Role: "hocvien", // Mặc định là học viên
  });

  const [avatar, setAvatar] = useState<File | null>(null); // State for avatar
  const [showPassword, setShowPassword] = useState(false); // Hiển thị mật khẩu

  // API đăng ký
  const signUpAPI = async () => {
    try {
      const userData = {
        ...formData,
        AnhDaiDien: avatar ? await uploadAvatar(avatar) : "", // Nếu avatar tồn tại, upload và lấy URL
      };

      const response = await axios.post(`${BASE_URL}/signup`, userData);

      if (response.status === 201) {
        message.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || "Đăng ký thất bại!");
      } else {
        message.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  // Xử lý thay đổi input
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý upload avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatar(file);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpxzMJ80PmPGQIrDCKHeRwyW7nWreGvtR3ng&s";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý khi nhấn nút Đăng ký
  const handleRegister = async () => {
    // Kiểm tra dữ liệu hợp lệ trước khi gửi
    if (
      !formData.TenDangNhap ||
      !formData.Email ||
      !formData.MatKhau ||
      !formData.HoTen ||
      !formData.SDT
    ) {
      message.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await signUpAPI(); // Gọi API đăng ký
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Xử lý đăng ký Google thành công
  const handleGoogleSignupSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (credentialResponse.credential) {
      try {
        const response = await axios.post(`${BASE_URL}/google-register`, {
          token: credentialResponse.credential,
        });

        if (response.status === 201) {
          message.success(
            "Đăng ký bằng Google thành công! Vui lòng đăng nhập để tiếp tục."
          );
          localStorage.setItem("token", response.data.token);
        }
      } catch (error) {
        message.error("Đăng ký bằng Google thất bại.");
      }
    }
  };

  // Xử lý lỗi đăng ký Google
  const handleGoogleSignupError = () => {
    message.error("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
  };

  return (
    <GoogleOAuthProvider clientId="570267955759-aclm1247o0pncpdj9nihpev3q55odurh.apps.googleusercontent.com">
      <div>
        <div className="form-group">
          <label htmlFor="registerName">Tên đăng nhập</label>
          <input
            type="text"
            className="form-control rounded-input"
            id="registerName"
            placeholder="Nhập tên đăng nhập"
            name="TenDangNhap"
            value={formData.TenDangNhap}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="registerEmail">Email</label>
          <input
            type="email"
            className="form-control rounded-input"
            id="registerEmail"
            placeholder="Nhập email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="registerPassword">Mật khẩu</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control rounded-input"
              id="registerPassword"
              placeholder="Nhập mật khẩu"
              name="MatKhau"
              value={formData.MatKhau}
              onChange={handleChange}
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
        </div>

        <div className="form-group">
          <label htmlFor="registerFullName">Họ tên</label>
          <input
            type="text"
            className="form-control rounded-input"
            id="registerFullName"
            placeholder="Nhập họ tên"
            name="HoTen"
            value={formData.HoTen}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Giới tính</label>
          <select
            className="form-control"
            name="GioiTinh"
            value={formData.GioiTinh ? "true" : "false"}
            onChange={handleChange}
          >
            <option value="true">Nam</option>
            <option value="false">Nữ</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="registerPhone">Số điện thoại</label>
          <input
            type="text"
            className="form-control rounded-input"
            id="registerPhone"
            placeholder="Nhập số điện thoại"
            name="SDT"
            value={formData.SDT}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="registerAvatar">Avatar</label>
          <input
            type="file"
            className="form-control-file"
            id="registerAvatar"
            name="AnhDaiDien"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          {avatar && <div className="mt-2">File đã chọn: {avatar.name}</div>}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRegister} // Xử lý đăng ký khi click
        >
          Đăng ký
        </button>

        {/* Nút đăng ký Google */}
        <div className="mt-3">
          <GoogleLogin
            onSuccess={handleGoogleSignupSuccess}
            onError={handleGoogleSignupError}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
