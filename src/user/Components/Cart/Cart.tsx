import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../../../public/user/css/Cart.css";
import { BASE_URL } from "../../../util/fetchfromAPI";
import { useLocation, useNavigate } from "react-router-dom";

const { Option } = Select;

const CartPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const requestParams = Object.fromEntries(queryParams.entries());

    // Chỉ thực hiện xử lý nếu có tham số VNPay
    if (Object.keys(requestParams).some((key) => key.startsWith("vnp_"))) {
      const handleVNPayPaymentReturn = async (
        params: Record<string, string>
      ) => {
        try {
          const headers = getAuthHeaders();
          const response = await axios.get(`${BASE_URL}/vnpay/paymentReturn`, {
            params: params,
            headers: headers,
          });

          return response.data;
        } catch (error) {
          console.error("Lỗi khi xác nhận thanh toán VNPay:", error);
          throw error;
        }
      };

      handleVNPayPaymentReturn(requestParams)
        .then((response) => {
          const { status, message } = response;

          switch (status) {
            case "SUCCESS":
              // Lấy mã đơn hàng từ tham số
              const orderCode =
                queryParams.get("vnp_OrderInfo") ||
                queryParams.get("orderCode") ||
                generateOrderCode();

              // Đặt trạng thái thanh toán
              setPaymentMethod("VNPAY");

              // Xử lý xác nhận thanh toán
              handleConfirmPayment(orderCode);
              break;
            case "FAILED":
              alert(message || "Giao dịch thất bại.");
              navigate("/cart");
              break;
            case "INVALID":
              alert(message || "Giao dịch không hợp lệ.");
              navigate("/cart");
              break;
            default:
              alert(message || "Lỗi không xác định.");
              navigate("/cart");
              break;
          }
        })
        .catch((error) => {
          console.error("Error handling VNPay payment return:", error);
          alert("Lỗi xử lý thanh toán VNPay.");
          navigate("/cart");
        });
    }
  }, [location, navigate]);

  const getAuthToken = () => localStorage.getItem("token");
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCartItems = async () => {
    try {
      const headers = getAuthHeaders();
      const { data } = await axios.get(`${BASE_URL}/don-hang`, { headers });
      setCartItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const calculateTotalPrice = () =>
    cartItems.reduce((total, item) => {
      const price = item.IDKhoaHoc_KhoaHoc?.GiaTien || 0;
      return total + price;
    }, 0);

  const handleDeleteItem = async (IDDonHang: number) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${BASE_URL}/don-hang/delete/${IDDonHang}`, {
        headers,
      });
      setCartItems(cartItems.filter((item) => item.IDDonHang !== IDDonHang));
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
    }
  };

  const showPaymentModal = () => {
    setPaymentModalVisible(true);
  };

  const handleCancelPayment = () => {
    setPaymentModalVisible(false);
  };
  const generateOrderCode = (): string => {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // Tạo mã 8 số ngẫu nhiên
    return `ORD${randomNumber}`;
  };
  const handleVNPayPayment = async () => {
    try {
      // Tạo mã đơn hàng ngẫu nhiên
      const orderCode = generateOrderCode();

      // Lấy URL từ biến môi trường
      const REACT_APP_URL = window.location.origin;

      // Tính tổng giá trị đơn hàng
      const totalPrice = calculateTotalPrice();

      // Gọi API tạo thanh toán VNPay
      const response = await axios.get(`${BASE_URL}/vnpay/payment`, {
        params: {
          amount: totalPrice,
          orderCode: orderCode,
          returnUrl: REACT_APP_URL,
        },
        headers: getAuthHeaders(),
      });
      if (response.data) {
        // Điều hướng người dùng tới URL thanh toán VNPay
        window.location.href = response.data;
      } else {
        // Thông báo lỗi nếu không có URL thanh toán
        alert("Lỗi tạo thanh toán VNPay");
      }
    } catch (error) {
      console.error("Error creating VNPay payment:", error);
      alert("Lỗi khi tạo thanh toán VNPay");
    }
  };
  const handleConfirmPayment = async (orderCode?: string) => {
    const headers = getAuthHeaders();
    const paymentData = {
      PhuongThucThanhToan: paymentMethod || "VNPAY",
      NoiDungThanhToan: paymentNote || "Thanh toán giỏ hàng",
    };
    if (paymentMethod === "VNPAY" && (!orderCode || orderCode.trim() === "")) {
      await handleVNPayPayment();
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/thanh-toan/add`,
        paymentData,
        { headers }
      );
      console.log("Thanh toán thành công:", response.data);
      setCartItems([]);
      alert("Thanh toán thành công!");
      setPaymentModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="cart-container">
      <h2>Giỏ hàng của bạn</h2>
      <div className="cart-header">
        <span className="product-info">Sản phẩm</span>
        <span className="price">Đơn giá</span>
        <span className="quantity">Số lượng</span>
        <span className="total-price">Số tiền</span>
        <span className="action">Thao tác</span>
      </div>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.IDDonHang} className="cart-item">
            <div className="product-info">
              {item.IDKhoaHoc_KhoaHoc?.HinhAnh ? (
                <img
                  src={item.IDKhoaHoc_KhoaHoc.HinhAnh}
                  alt={item.IDKhoaHoc_KhoaHoc.TenKhoaHoc}
                  className="product-image"
                />
              ) : (
                <span>Hình ảnh không có sẵn</span>
              )}
              <span>
                {item.IDKhoaHoc_KhoaHoc?.TenKhoaHoc || "Tên khóa học không có"}
              </span>
            </div>
            <div className="price">
              {item.IDKhoaHoc_KhoaHoc?.GiaTien?.toLocaleString() || "0 đ"}
            </div>
            <div className="quantity">1</div>
            <div className="total-price">
              {item.TongTien?.toLocaleString() || "0 đ"}
            </div>
            <div className="action">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteItem(item.IDDonHang)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="total">
          Tổng tiền: <span>{calculateTotalPrice().toLocaleString()} đ</span>
        </div>
        <Button type="primary" size="large" onClick={showPaymentModal}>
          Thanh toán
        </Button>
      </div>
      <Modal
        title="Thông tin thanh toán"
        visible={isPaymentModalVisible}
        onOk={() => handleConfirmPayment("")}
        onCancel={handleCancelPayment}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div>
          <label>Phương thức thanh toán:</label>
          <Select
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value)}
            placeholder="Chọn phương thức thanh toán"
            style={{ width: "100%", marginTop: "8px", marginBottom: "16px" }}
          >
            <Option value="Cash">Thanh toán tiền mặt</Option>
            <Option value="MOMO">Chuyển khoản MOMO</Option>
            <Option value="VNPAY">Chuyển khoản VNPAY</Option>
          </Select>
        </div>
        <div>
          <label>Nội dung thanh toán:</label>
          <Input.TextArea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Nhập ghi chú (nếu có)"
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;
