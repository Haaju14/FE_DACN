import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../../../util/fetchfromAPI";
import axios from "axios";
import { RootState } from "../../../redux/store";
import { login } from "../../../redux/reducers/userReducer";
import * as Yup from 'yup';

interface ProfileProps {
  user: {
    IDNguoiDung: number;
    TenDangNhap: string;
    Email: string;
    HoTen: string;
    SDT: string;
    GioiTinh: boolean;
    AnhDaiDien?: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [passwordNotification, setPasswordNotification] = useState("");
  const [userData, setUserData] = useState(user);
  const [showPassword, setShowPassword] = useState(false);
  const { userLogin } = useSelector((state: RootState) => state.userReducer);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const profileSchema = Yup.object().shape({
    TenDangNhap: Yup.string()
      .required('Tên đăng nhập là bắt buộc')
      .min(6, 'Tên đăng nhập phải có ít nhất 6 ký tự')
      .max(20, 'Tên đăng nhập không được vượt quá 20 ký tự')
      .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    Email: Yup.string()
      .required('Email là bắt buộc')
      .email('Email không hợp lệ'),
    HoTen: Yup.string()
      .required('Họ tên là bắt buộc')
      .max(50, 'Họ tên không được vượt quá 50 ký tự'),
    SDT: Yup.string()
      .required('Số điện thoại là bắt buộc')
      .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(11, 'Số điện thoại không được vượt quá 11 số')
  });

  useEffect(() => {
    console.log("Redux state sau khi cập nhật:", userLogin);
  }, [userLogin]);

  const formik = useFormik({
    initialValues: {
      TenDangNhap: userLogin?.user.TenDangNhap || "",
      Email: userLogin?.user.Email || "",
      HoTen: userLogin?.user.HoTen || "",
      SDT: userLogin?.user.SDT || "",
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const token = userLogin?.token;
        if (!token) {
          throw new Error("Token không hợp lệ");
        }

        const response = await axios.put(
          `${BASE_URL}/user/profile`,
          {
            TenDangNhap: values.TenDangNhap,
            Email: values.Email,
            HoTen: values.HoTen,
            SDT: values.SDT,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Dữ liệu trả về từ API:", response.data);

        const userData = {
          IDNguoiDung: response.data.content.IDNguoiDung,
          TenDangNhap: response.data.content.TenDangNhap,
          Email: response.data.content.Email,
          HoTen: response.data.content.HoTen,
          SDT: response.data.content.SDT,
          Role: response.data.content.Role,
          GioiTinh: response.data.content.GioiTinh,
          AnhDaiDien: response.data.content.AnhDaiDien,
        };

        dispatch(login({ user: userData, token }));
        setNotification("Cập nhật thông tin thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin:", error);
        setNotification("Lỗi khi cập nhật thông tin cá nhân!");
      }
    },
  });

  if (!userLogin) {
    return <div>Đang tải thông tin...</div>;
  }




  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        setPasswordNotification(
          "Mật khẩu mới và xác nhận mật khẩu không khớp."
        );
        return;
      }

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${BASE_URL}/change-password`,
          {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPasswordNotification("Đổi mật khẩu thành công!");
        setTimeout(() => setPasswordNotification(""), 3000);
        setShowPasswordModal(false);
      } catch (error) {
        setPasswordNotification("Mật khẩu cũ của bạn không chính xác!");
        console.error("Error changing password:", error);
      }
    },
  });

  return (
    <div>
      {passwordNotification && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3">
          {passwordNotification}
        </div>
      )}
      <div className="profile card p-3">
        <div className="profile-info mt-3">
          <h2>Hello, I'm {userData.HoTen}</h2>
          <p>Join in 2024</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Chỉnh sửa
          </button>
          <button
            className="btn btn-primary ml-2"
            onClick={() => setShowPasswordModal(true)}
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {notification && <div className="alert alert-info">{notification}</div>}

      {showModal && (
        <>
          <div
            className="modal-backdrop"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          ></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="TenDangNhap">Tên đăng nhập</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.TenDangNhap && formik.errors.TenDangNhap ? 'is-invalid' : ''
                          }`}
                        id="TenDangNhap"
                        name="TenDangNhap"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.TenDangNhap}
                      />
                      {formik.touched.TenDangNhap && formik.errors.TenDangNhap && (
                        <div className="invalid-feedback">{formik.errors.TenDangNhap}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="Email">Email</label>
                      <input
                        type="email"
                        className={`form-control ${formik.touched.Email && formik.errors.Email ? 'is-invalid' : ''
                          }`}
                        id="Email"
                        name="Email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.Email}
                      />
                      {formik.touched.Email && formik.errors.Email && (
                        <div className="invalid-feedback">{formik.errors.Email}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="HoTen">Họ tên</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.HoTen && formik.errors.HoTen ? 'is-invalid' : ''
                          }`}
                        id="HoTen"
                        name="HoTen"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.HoTen}
                      />
                      {formik.touched.HoTen && formik.errors.HoTen && (
                        <div className="invalid-feedback">{formik.errors.HoTen}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="SDT">Số điện thoại</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.SDT && formik.errors.SDT ? 'is-invalid' : ''
                          }`}
                        id="SDT"
                        name="SDT"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.SDT}
                      />
                      {formik.touched.SDT && formik.errors.SDT && (
                        <div className="invalid-feedback">{formik.errors.SDT}</div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showPasswordModal && (
        <div
          className="modal fade show d-block"
          style={{ display: "block" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đổi mật khẩu</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowPasswordModal(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={passwordFormik.handleSubmit}>
                  <div className="form-group">
                    <label>Mật khẩu cũ</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="oldPassword"
                      onChange={passwordFormik.handleChange}
                      value={passwordFormik.values.oldPassword}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="newPassword"
                      onChange={passwordFormik.handleChange}
                      value={passwordFormik.values.newPassword}
                    />
                  </div>
                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="confirmPassword"
                      onChange={passwordFormik.handleChange}
                      value={passwordFormik.values.confirmPassword}
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
                  {passwordNotification && (
                    <div className="alert alert-info">
                      {passwordNotification}
                    </div>
                  )}
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
