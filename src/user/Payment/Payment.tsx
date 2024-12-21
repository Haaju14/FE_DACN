import React, { useEffect, useState } from "react";
import { Table, Spin, message } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import '../../../public/user/css/Payment.css'
const PaymentHistoryPage: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Bạn cần đăng nhập để xem lịch sử thanh toán.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${BASE_URL}/thanh-toan-nguoi-dung`, { headers });

      if (response.data && response.data.statusCode === 200) {
        setPaymentHistory(response.data.content);
      } else {
        message.warning(response.data.message || "Không có dữ liệu.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử thanh toán:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const columns = [
    {
      title: "Mã thanh toán",
      dataIndex: "IDThanhToan",
      key: "IDThanhToan",
      className: "align-left",
    },
    {
      title: "Phương thức",
      dataIndex: "PhuongThucThanhToan",
      key: "PhuongThucThanhToan",
      className: "align-left",
    },
    {
      title: "Nội dung",
      dataIndex: "NoiDungThanhToan",
      key: "NoiDungThanhToan",
      className: "align-left",
    },
    {
      title: "Số tiền",
      dataIndex: "TongTien",
      key: "TongTien",
      className: "align-left",
      render: (text: number) => (
        <span className="money-cell align-left">{text.toLocaleString()}VND</span>
      ),
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "NgayThanhToan",
      key: "NgayThanhToan",
      className: "align-left",
      render: (date: string) => (
        <span className="date-cell align-left">{new Date(date).toLocaleString()}</span>
      ),
    },
  ];


  return (
    <div style={{ padding: "20px", }}>
      <h2>Lịch sử thanh toán</h2>
      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : (
        <Table
          columns={columns}
          dataSource={paymentHistory}
          rowKey="IDThanhToan"
          bordered
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 10 }}
        />
      )}
    </div>
  );
};

export default PaymentHistoryPage;
