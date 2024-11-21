import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../util/fetchfromAPI";
import "../../../../public/user/css/ChatBox.css";

const ChatApp: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  const getToken = () => localStorage.getItem("token");

  const getRole = () => {
    const userLogin = localStorage.getItem("userLogin");
    if (userLogin) {
      try {
        const userData = JSON.parse(userLogin);
        return userData.user.Role;
      } catch (error) {
        console.error("Lỗi khi phân tích JSON từ localStorage:", error);
        return null;
      }
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      console.log("token: ", token);

      const role = getRole();
      console.log("role: ", role);

      if (!token) {
        console.error("Token không tồn tại");
        return;
      }

      if (!role) {
        console.error("Role không tồn tại");
        return;
      }

      if (!["admin", "giangvien", "hocvien"].includes(role)) {
        console.error("Role không hợp lệ");
        return;
      }

      let allUsers: any[] = [];

      if (role === "admin") {
        const responseGiangVien = await axios.get(`${BASE_URL}/giangvien/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseHocVien = await axios.get(`${BASE_URL}/hocvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const giangVienData = Array.isArray(responseGiangVien.data.content)
          ? responseGiangVien.data.content
          : [];
        const hocVienData = Array.isArray(responseHocVien.data.content)
          ? responseHocVien.data.content
          : [];

        allUsers = [...giangVienData, ...hocVienData];
      } else if (role === "giangvien") {
        const responseAdmin = await axios.get(`${BASE_URL}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseHocVien = await axios.get(`${BASE_URL}/hocvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const adminData = Array.isArray(responseAdmin.data.content)
          ? responseAdmin.data.content
          : [];
        const hocVienData = Array.isArray(responseHocVien.data.content)
          ? responseHocVien.data.content
          : [];

        allUsers = [...adminData, ...hocVienData];
      } else if (role === "hocvien") {
        const responseGiangVien = await axios.get(`${BASE_URL}/giangvien/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const giangVienData = Array.isArray(responseGiangVien.data.content)
          ? responseGiangVien.data.content
          : [];
        allUsers = giangVienData;
      }

      setUsers(allUsers);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="chat-app">
      <button className="chat-icon" onClick={() => setSidebarVisible(true)}>
        <i className="gg-chat" />
      </button>

      {sidebarVisible && (
        <div className="sidebar show">
          <button
            className="sidebar-close"
            onClick={() => setSidebarVisible(false)}
          >
            <strong>X</strong>
          </button>

          <div className="sidebar-logo">
            <div className="logo-header" />
          </div>

          <div className="sidebar-wrapper">
            <div className="sidebar-content">
              <div className="user-list">
                {loading ? (
                  <div>Đang tải...</div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.IDNguoiDung}
                      onClick={() => setSelectedUser(user)}
                      className="user-item"
                    >
                      <img
                        src={user.AnhDaiDien || "default-avatar.jpg"}
                        alt={user.HoTen}
                        className="avatar"
                      />
                      <span>{user.HoTen}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat với {selectedUser.HoTen}</h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="close-chat"
            >
              ×
            </button>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === "teacher" ? "teacher-message" : "user-message"
                }
              >
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
