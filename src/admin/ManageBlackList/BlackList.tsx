import React, { useEffect, useState } from "react";
import { Spin, Card, message } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/ManageBlackList.css";

const BlackList: React.FC = () => {
  const [blackList, setBlackList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchBlackList = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/blacklist/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlackList(response.data.content);
      } catch (error) {
        console.error("Error fetching blacklist:", error);
        message.error("Có lỗi xảy ra khi tải danh sách khóa học.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlackList();
  }, []);

  const removeFromBlacklist = async (id: number) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `${BASE_URL}/blacklist/remove/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Đã gỡ khóa học khỏi danh sách đen.");
        // Cập nhật lại danh sách sau khi xóa thành công
        setBlackList((prevBlackList) =>
          prevBlackList.filter((khoaHoc) => khoaHoc.IDKhoaHoc !== id)
        );
      }
    } catch (error) {
      console.error("Error removing course from blacklist:", error);
      message.error("Có lỗi xảy ra khi gỡ khóa học khỏi danh sách đen.");
    }
  };

  if (loading) {
    return <Spin tip="Đang tải danh sách khóa học..." />;
  }

  return (
    <div className="manage-blacklist-container">
      <h1>Danh sách khóa học trong Blacklist</h1>
      <div className="manage-blacklist-grid">
        {blackList.length === 0 ? (
          <p>Không có khóa học nào trong blacklist.</p>
        ) : (
          blackList.map((khoaHoc) => (
            <Card key={khoaHoc.IDKhoaHoc} className="manage-blacklist-card">
              <div className="manage-blacklist-course-info-row">
                <div className="manage-blacklist-course-info">
                  <i className="fa fa-address-book"></i>
                  <span className="info-label">Tên khóa học:</span>
                  {khoaHoc.TenKhoaHoc || "Chưa có tên"}
                </div>
                <div className="manage-blacklist-course-info">
                  <i className="fas fa-calendar-alt"></i>
                  <span className="info-label">Ngày thêm vào blacklist:</span>
                  {new Date(khoaHoc.NgayThemVaoBlackList).toLocaleDateString()}
                </div>
              </div>

              <div className="manage-blacklist-course-info-row">
                <div className="manage-blacklist-course-info">
                  <i className="fas fa-exclamation-circle"></i>
                  <span className="info-label">Lý do:</span>
                  {khoaHoc.LyDo || "Không có lý do"}
                </div>
                <div className="manage-blacklist-course-info">
                  <i className="fa fa-pencil-alt"></i>
                  <span className="info-label">Mô tả:</span>
                  {khoaHoc.MoTaKhoaHoc || "Chưa có mô tả"}
                </div>
              </div>

              <div className="manage-blacklist-course-info-row">
                <div className="manage-blacklist-course-info">
                  <i className="fas fa-dollar-sign"></i>
                  <span className="info-label">Giá tiền:</span>
                  {khoaHoc.GiaTien || "Chưa có giá"}
                </div>
                <div className="manage-blacklist-course-info">
                  <i className="fas fa-tags"></i>
                  <span className="info-label">Loại khóa học:</span>
                  {khoaHoc.LoaiKhoaHoc || "Chưa có loại khóa học"}
                </div>
              </div>

              <button
                className="manage-blacklist-btn btn btn-danger"
                onClick={() => removeFromBlacklist(khoaHoc.IDKhoaHoc)}
              >
                <i className="fas fa-trash-alt"></i> Gỡ bỏ
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlackList;
