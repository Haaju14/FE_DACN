import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/ThongKe.css";

interface ThongKeItem {
  TenKhoaHoc: string;
  TongThuNhap: number;
}

const ThongKeThuNhap = () => {
  const [data, setData] = useState<ThongKeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/thong-ke-thu-nhap`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching income data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu thống kê thu nhập.");
        message.error("Có lỗi xảy ra khi tải dữ liệu thống kê thu nhập.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin tip="Đang tải..." />;
  }

  // Tính tổng doanh thu
  const totalIncome = data.reduce((total, item) => total + item.TongThuNhap, 0);

  return (
    <div className="manage-followers-container">
      <h1>Thống Kê Thu Nhập Theo Khóa Học</h1>
      {error && <p className="error-message">{error}</p>}

      {data.length === 0 ? (
        <p className="no-data-message">Không có dữ liệu thu nhập để hiển thị.</p>
      ) : (
        <div className="income-table">
          <table>
            <thead>
              <tr>
                <th>Tên Khóa Học</th>
                <th>Tổng Thu Nhập (VND)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.TenKhoaHoc}>
                  <td>{item.TenKhoaHoc}</td>
                  <td>{item.TongThuNhap.toLocaleString()} VND</td>
                </tr>
              ))}
              <tr>
                <td><strong>Tổng Doanh Thu</strong></td>
                <td><strong>{totalIncome.toLocaleString()} VND</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ThongKeThuNhap;
