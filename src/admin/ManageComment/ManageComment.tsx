import React, { useEffect, useState } from "react";
import { Spin, Card, Button, Modal, message } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/ManageComment.css";

const ManageComment: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/binh-luan`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(response.data.content);
      } catch (error) {
        console.error("Error fetching comments:", error);
        message.error("Có lỗi xảy ra khi tải danh sách bình luận.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleViewDetails = async (id: number) => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/binh-luan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedComment(response.data.content);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching comment details:", error);
      message.error("Có lỗi xảy ra khi tải chi tiết bình luận.");
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      const token = getToken();
      await axios.delete(`${BASE_URL}/binh-luan/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.IDBinhLuan !== id)
      );
      message.success("Xóa bình luận thành công.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Xóa bình luận thất bại.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedComment(null);
  };

  if (loading) {
    return <Spin tip="Đang tải danh sách bình luận..." />;
  }

  return (
    <div className="manage-comments-container">
      <h1>Danh sách bình luận</h1>
      <div className="comment-grid">
        {comments.length === 0 ? (
          <p>Không có bình luận nào.</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="comment-card">
              <div className="comment-info">
                <span className="info-label">ID bình luận:</span>{" "}
                {comment.IDBinhLuan}
              </div>
              <div className="comment-info">
                <span className="info-label">ID Khóa học đã bình luận:</span>{" "}
                {comment.IDKhoaHoc}
              </div>
              <div className="comment-info">
                <span className="info-label">Ngày bình luận:</span>{" "}
                {comment.ThoiGian}
              </div>
              <div className="comment-info">
                <span className="info-label">Nội dung:</span> {comment.NoiDung}
              </div>
              <div className="comment-actions">
                <div>
                  <Button
                    type="primary"
                    onClick={() => handleViewDetails(comment.IDBinhLuan)}
                  >
                    <i className="fa fa-eye"></i>
                  </Button>
                </div>
                <div>
                  <Button
                    className="ant-btn ant-btn-danger"
                    onClick={() => handleDeleteComment(comment.IDBinhLuan)}
                  >
                    <i className="fa fa-trash"></i>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal hiển thị chi tiết bình luận */}
      <Modal
        title="Chi Tiết Bình Luận"
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
      >
        {selectedComment ? (
          <div>
            <p>
              <strong>ID Bình Luận:</strong> {selectedComment.IDBinhLuan}
            </p>
            <p>
              <strong>Họ tên người bình luận:</strong>{" "}
              {selectedComment.IDNguoiDung_NguoiDung.HoTen}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {selectedComment.IDNguoiDung_NguoiDung.Email}
            </p>
            <p>
              <strong>Tên khóa học bình luận:</strong>{" "}
              {selectedComment.IDKhoaHoc_KhoaHoc.TenKhoaHoc}
            </p>
            <p>
              <strong>Nội Dung:</strong> {selectedComment.NoiDung}
            </p>
            <p>
              <strong>Thời Gian:</strong> {selectedComment.ThoiGian}
            </p>
          </div>
        ) : (
          <Spin tip="Đang tải chi tiết bình luận..." />
        )}
      </Modal>
    </div>
  );
};

export default ManageComment;
