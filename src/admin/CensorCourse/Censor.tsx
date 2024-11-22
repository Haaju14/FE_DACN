import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Spin } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/PaymentAdmin.css";

const CourseApprovalPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]); // Dữ liệu khóa học
  const [loading, setLoading] = useState<boolean>(true); // Trạng thái loading
  const [isModalVisible, setIsModalVisible] = useState(false); // Hiển thị modal từ chối
  const [rejectReason, setRejectReason] = useState(""); // Lý do từ chối
  const [selectedCourse, setSelectedCourse] = useState<any>(null); // Khóa học được chọn

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Cấu hình header với token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Lấy danh sách khóa học cần duyệt
  const fetchAllKhoaHoc = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Bạn cần đăng nhập để xem danh sách khóa học.");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${BASE_URL}/khoa-hoc-kiem-duyet`, { headers });

      if (response.data && response.data.statusCode === 200) {
        setCourses(response.data.content || []);
      } else {
        message.warning(response.data.message || "Không có khóa học nào cần duyệt.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học:", error);
      message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Duyệt khóa học
  const handleApprove = async (idKhoaHoc: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/kiem-duyet-khoa-hoc`,
        { idKhoaHoc, trangThai: "da_duyet" },
        { headers: getAuthHeaders() }
      );
      if (response.data.statusCode === 200) {
        message.success("Khóa học đã được duyệt");

        // Cập nhật trạng thái khóa học trong state
        setCourses(courses.map(course => 
          course.IDKhoaHoc === idKhoaHoc ? { ...course, TrangThai: 'da_duyet' } : course
        ));
      } else {
        message.error(response.data.message || "Lỗi duyệt khóa học");
      }
    } catch (error) {
      console.error("Lỗi duyệt khóa học:", error);
      message.error("Đã xảy ra lỗi khi duyệt khóa học.");
    }
  };

  // Từ chối khóa học
  const handleReject = async (IDKhoaHoc: any) => {
    if (!rejectReason) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/kiem-duyet-khoa-hoc`,
        { idKhoaHoc: selectedCourse.IDKhoaHoc, trangThai: "tu_choi", lyDo: rejectReason },
        { headers: getAuthHeaders() }
      );
      if (response.data.statusCode === 200) {
        message.success("Khóa học đã bị từ chối");
        setIsModalVisible(false);

        // Cập nhật trạng thái khóa học trong state
        setCourses(courses.map(course => 
          course.IDKhoaHoc === selectedCourse.IDKhoaHoc ? { ...course, TrangThai: 'tu_choi' } : course
        ));
      } else {
        message.error(response.data.message || "Lỗi từ chối khóa học");
      }
    } catch (error) {
      console.error("Lỗi từ chối khóa học:", error);
      message.error("Đã xảy ra lỗi khi từ chối khóa học.");
    }
  };

  // Mở modal để nhập lý do từ chối
  const showRejectModal = (course: any) => {
    setSelectedCourse(course);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setRejectReason("");
  };

  // Cột cho bảng Ant Design
  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "TenKhoaHoc",
      key: "TenKhoaHoc",
      align: "center",
    },
    {
      title: "Giảng viên",
      dataIndex: "IDNguoiDung",
      key: "IDNguoiDung",
      align: "center",
    },
    {
      title: "Danh mục",
      dataIndex: "IDDanhMuc",
      key: "IDDanhMuc",
      align: "center",
    },
    {
      title: "Ngày đăng",
      dataIndex: "NgayDang",
      key: "NgayDang",
      align: "center",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text: string, record: any) => (
        <div>
          <Button
            type="primary"
            onClick={() => handleApprove(record.IDKhoaHoc)}
            style={{ marginRight: 8 }}
          >
            Duyệt
          </Button>
          <Button 
            type="default" 
            style={{ backgroundColor: 'red', color: 'white' }} 
            onClick={() => {
                handleReject(record.IDKhoaHoc);
                setIsModalVisible(true);
            }}>
            Từ chối
            </Button>

        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchAllKhoaHoc();
  }, []); // Chỉ gọi fetchAllKhoaHoc khi component được mount lần đầu

  if (loading) {
    return (
      <div className="spin-container">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="payment-management-container">
      <h2>Quản lý duyệt khóa học</h2>
      <Table
        dataSource={courses}
        columns={columns}
        rowKey="IDKhoaHoc"
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title="Nhập lý do từ chối"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleReject}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default CourseApprovalPage;
