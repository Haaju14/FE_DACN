import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { message as antdMessage } from "antd";
import { RootState } from "../../../redux/store";
import Profile from "./Profile";
import axios from "axios";
import { BASE_URL } from "../../../util/fetchfromAPI";
import { login } from "../../../redux/reducers/userReducer"; // Import action login

const UserProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { userLogin } = useSelector((state: RootState) => state.userReducer);
  const [showForm, setShowForm] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [avatar, setAvatar] = useState(userLogin?.user?.AnhDaiDien || "");

  useEffect(() => {
    setAvatar(userLogin?.user?.AnhDaiDien || "");
  }, [userLogin]);

  if (!userLogin) {
    return <div>User is not logged in. Please log in to access this page.</div>;
  }

  const userData = { ...userLogin.user };

  const handleAvatarChange = async () => {
    if (urlInput.trim() === "") {
      antdMessage.error("Vui lòng nhập URL hợp lệ.", 5);
      return;
    }

    try {
      const token = userLogin.token;
      if (!token) {
        throw new Error("Token không hợp lệ");
      }

      // Gọi API để cập nhật avatar
      const response = await axios.put(
        `${BASE_URL}/user/profile`,
        { AnhDaiDien: urlInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        antdMessage.success("Avatar đã được thay đổi thành công!", 5);
        setShowForm(false);
        setShowModal(false);

        const updatedUser = {
          ...userLogin.user,
          AnhDaiDien: urlInput, // Cập nhật avatar mới
        };

        // Cập nhật Redux state và localStorage
        dispatch(login({ user: updatedUser, token }));
        setAvatar(urlInput); // Cập nhật hiển thị avatar
      } else {
        antdMessage.error(response.data.message || "Đã xảy ra lỗi.", 5);
      }
    } catch (error) {
      antdMessage.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Đã xảy ra lỗi từ server."
          : "Đã xảy ra lỗi không xác định.",
        5
      );
    }
  };

  return (
    <div className="user-profile-page container mt-5">
      <div className="row">
        {/* Thông tin cơ bản */}
        <div className="col-md-4">
          <div className="card text-center">
            <img
              src={avatar || "/default-avatar.png"}
              alt="Avatar"
              className="card-img-top rounded-circle mx-auto mt-3"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
            <div className="card-body">
              <button
                className="btn btn-primary mt-3"
                style={{ marginBottom: "5px" }}
                onClick={() => setShowModal(true)}
              >
                Thay đổi avatar
              </button>
              <Profile user={userData} />
            </div>
          </div>
        </div>
        {/* Modal hiển thị form nhập URL */}
        {showModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
                textAlign: "center",
              }}
            >
              <h5>Thay đổi avatar</h5>
              <input
                type="text"
                className="form-control mt-3"
                placeholder="Nhập URL avatar mới"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button
                className="btn btn-primary mt-3"
                onClick={handleAvatarChange}
              >
                Thay đổi
              </button>
              <button
                className="btn btn-secondary mt-3"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        {/* Thông tin chi tiết */}
        <div className="col-md-8">
          <div className="card">
            <div
              className="card-header bg-primary text-white d-flex justify-content-center"
            >
              <h5>Thông tin chi tiết</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Tên đăng nhập:</strong> {userData.TenDangNhap}
                  </p>
                  <p>
                    <strong>Email:</strong> {userData.Email}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Họ và tên:</strong> {userData.HoTen || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {userData.SDT || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <hr />
              <p className="text-muted">
                <strong>Lưu ý:</strong> Để thay đổi thông tin cá nhân, vui lòng
                sử dụng mục *Chỉnh sửa* hoặc *Đổi mật khẩu*.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
