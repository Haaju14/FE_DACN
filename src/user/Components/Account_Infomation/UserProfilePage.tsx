import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import Profile from "./Profile";

const UserProfilePage: React.FC = () => {
  const { userLogin } = useSelector((state: RootState) => state.userReducer);

  if (!userLogin) {
    return <div>User is not logged in. Please log in to access this page.</div>;
  }

  const userData = { ...userLogin.user };
  if (!userLogin) {
    return (
      <div className="user-profile-page container text-center mt-5">
        <h2>Người dùng chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để truy cập thông tin cá nhân của bạn.</p>
      </div>
    );
  }

  const { TenDangNhap, Email, HoTen, SDT, AnhDaiDien } = userLogin.user;

  return (
    <div className="user-profile-page container mt-5">
      <div className="row">
        {/* Thông tin cơ bản */}
        <div className="col-md-4">
          <div className="card text-center">
            <img
              src={AnhDaiDien || "/default-avatar.png"}
              alt="Avatar"
              className="card-img-top rounded-circle mx-auto mt-3"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
            <div className="card-body">
              <Profile user={userData} />
            </div>
          </div>
          
        </div>

        {/* Thông tin chi tiết */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5>Thông tin chi tiết</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Tên đăng nhập:</strong> {TenDangNhap}
                  </p>
                  <p>
                    <strong>Email:</strong> {Email}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Họ và tên:</strong> {HoTen || "Chưa cập nhật"}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {SDT || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <hr />
              <p className="text-muted">
                <strong>Lưu ý:</strong> Để thay đổi thông tin cá nhân, vui lòng
<<<<<<< HEAD
                sử dụng mục *Chỉnh sửa* hoặc mật khẩu *Đổi mật khẩu*.
=======
                sử dụng mục *Edit profile* hoặc thay đổi mật khẩu *Đổi mật khẩu* .
>>>>>>> 07e2d4585cb97c25c47f4c58ce3e6a54d0c34bc4
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
