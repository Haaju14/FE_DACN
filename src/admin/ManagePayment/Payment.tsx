import React, { useEffect, useState } from "react";
import { Table, Spin, Tag, message } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/PaymentAdmin.css"
const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]); // Dữ liệu thanh toán
  const [loading, setLoading] = useState<boolean>(true); // Trạng thái loading

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Cấu hình header với token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Lấy danh sách thanh toán
  const fetchAllPayments = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Bạn cần đăng nhập để xem lịch sử thanh toán.");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${BASE_URL}/thanh-toan/all`, { headers });
  
        if (response.data && response.data.statusCode === 200) {
          setPayments(response.data.content);
        } else {
          message.warning(response.data.message || "Không có dữ liệu.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử thanh toán:", error);
        message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    fetchAllPayments();
  }, []);

  // Cột cho bảng Ant Design
  const columns = [
    {
        title: "Mã thanh toán",
        dataIndex: "IDThanhToan",
        key: "IDThanhToan",
        align: "center" as "center",
        render: (text: string) => <b>{text}</b>,
    },
    {
        title: "Người dùng",
        dataIndex: "IDNguoiDung",
        key: "IDNguoiDung",
        align: "center" as "center", 
    },
    {
        title: "Phương thức",
        dataIndex: "PhuongThucThanhToan",
        key: "PhuongThucThanhToan",
        align: "center" as "center",
        render: (method: string) => {
            // Kiểm tra phương thức thanh toán và gán màu hiển thị
            let color = "blue";
            let displayText = "Khác";
    
            switch (method) {
                case "Cash":
                    color = "green";
                    displayText = "Thanh toán tiền mặt";
                    break;
                case "MOMO":
                    color = "orange";
                    displayText = "Thanh toán bằng MOMO";
                    break;
                default:
                    color = "gray"; // Mặc định với phương thức chưa được định nghĩa
            }
    
            return <Tag color={color}>{displayText}</Tag>;
        },
    },
    
    {
        title: "Nội dung",
        dataIndex: "NoiDungThanhToan",
        key: "NoiDungThanhToan",
        align: "center" as "center", 
    },
    {
        title: "Số tiền",
        dataIndex: "TongTien",
        key: "TongTien",
        align: "center" as "center", // Sử dụng kiểu hợp lệ
        render: (amount: number) => `${amount.toLocaleString()} đ`,
    },
    {
        title: "Ngày thanh toán",
        dataIndex: "NgayThanhToan",
        key: "NgayThanhToan",
        align: "center" as "center", // Sử dụng kiểu hợp lệ
        render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
];


  if (loading) {
    return (
      <div className="spin-container">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="payment-management-container">
      <h2>Quản lý thanh toán</h2>
      <Table
        dataSource={payments}
        columns={columns}
        rowKey="IDThanhToan"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

export default PaymentManagementPage;
