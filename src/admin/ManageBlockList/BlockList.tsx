import React, { useEffect, useState } from "react";
import { Spin, Card, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/ManageBlockList.css";

const BlockList: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/block/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlockedUsers(response.data.content);
      } catch (error) {
        console.error("Error fetching blocked users:", error);
        message.error("Có lỗi xảy ra khi tải danh sách người dùng bị chặn.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  if (loading) {
    return <Spin tip="Đang tải danh sách người dùng bị chặn..." />;
  }

  return (
    <div className="manage-blocklist-container">
      <h1>Danh sách người dùng bị chặn</h1>
      <div className="blocklist-grid">
        {blockedUsers.length === 0 ? (
          <p>Không có người dùng bị chặn nào.</p>
        ) : (
          blockedUsers.map((user) => (
            <Card key={user.IDNguoiDung} className="blocklist-card">
              <div className="user-info-row">
                <div className="user-info">
                  <i
                    className="fas fa-user"
                    style={{
                      fontSize: "18px",
                      marginRight: "10px",
                      color: "#007bff",
                    }}
                  />
                  <span className="info-label">Tên:</span> {user.HoTen}
                </div>
                <div className="user-info">
                  <i
                    className="fas fa-envelope"
                    style={{
                      fontSize: "18px",
                      marginRight: "10px",
                      color: "#007bff",
                    }}
                  />
                  <span className="info-label">Email:</span> {user.Email}
                </div>
              </div>

              <div className="user-info-row">
                <div className="user-info">
                  {user.GioiTinh === "Nam" ? (
                    <i
                      className="fas fa-male"
                      style={{
                        fontSize: "18px",
                        marginRight: "10px",
                        color: "#007bff",
                      }}
                    />
                  ) : (
                    <i
                      className="fas fa-female"
                      style={{
                        fontSize: "18px",
                        marginRight: "10px",
                        color: "#007bff",
                      }}
                    />
                  )}
                  <span className="info-label">Giới tính:</span>{" "}
                  {user.GioiTinh || "Chưa xác định"}
                </div>
                <div className="user-info">
                  <i
                    className="fa fa-phone"
                    style={{
                      fontSize: "18px",
                      marginRight: "10px",
                      color: "#007bff",
                    }}
                  ></i>
                  <span className="info-label">SDT:</span> {user.SDT}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockList;
