import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../util/fetchfromAPI";
import "../../../../public/user/css/ChatBox.css";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const socket = io("ws://localhost:8081");

const ChatApp: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [dataChat, setDataChat] = useState<
    { content: string; IDNguoiDung: number }[]
  >([]);
  const [roomId, setRoomId] = useState<string | null>(null); // Thêm roomId để quản lý ID phòng

  const getToken = () => localStorage.getItem("token");

  const decodeUser = () => {
    const token = getToken();
    if (token) {
      try {
        return jwtDecode<any>(token);
      } catch (error) {
        console.error("Lỗi khi decode token:", error);
        return null;
      }
    }
    return null;
  };

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
      const role = getRole();

      if (
        !token ||
        !role ||
        !["admin", "giangvien", "hocvien"].includes(role)
      ) {
        console.error("Token hoặc role không hợp lệ");
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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Đã kết nối với server socket");
    });
    // Lắng nghe tin nhắn từ socket
    socket.on("sv-send-mess", ({ message, userId, roomId: receivedRoomId }) => {
      console.log("Received message:", { message, userId, receivedRoomId }); // Log tin nhắn nhận được
      // Kiểm tra nếu tất cả các trường cần thiết có dữ liệu
      if (!message || !userId || !receivedRoomId) {
        console.error("Missing fields in received data:", {
          message,
          userId,
          receivedRoomId,
        });
        return;
      }

      if (receivedRoomId === roomId) {
        // Kiểm tra nếu roomId khớp
        setDataChat((prev) => {
          const newDataChat = [
            ...prev,
            { content: message, IDNguoiDung: userId },
          ];
          console.log("Updated dataChat:", newDataChat); // Log cập nhật dataChat
          return newDataChat;
        });
      }
    });

    return () => {
      socket.off("sv-send-mess");
    };
  }, [roomId]);

  const showChat = () => {
    console.log("Opening chat...");
    setSidebarVisible(true);
  };

  useEffect(() => {
    console.log("Sidebar visibility:", sidebarVisible);
  }, [sidebarVisible]);

  const joinRoom = (selectedUser: any) => {
    const token = getToken();
    if (!token) {
      console.log("Token không hợp lệ");
      return;
    }

    console.log("Token:", token); // Kiểm tra token lấy được
    const infoUser: any = jwtDecode(token);

    // Kiểm tra xem thông tin người dùng đăng nhập có hợp lệ không
    if (!infoUser || !infoUser.data || !infoUser.data.id) {
      console.log("Thông tin người dùng không hợp lệ hoặc không có ID");
      return;
    }

    console.log("Decoded user info:", infoUser); // In thông tin giải mã

    // Lấy ID của người đăng nhập và ID người dùng đã chọn
    const currentUserID = infoUser.data.id; // ID người dùng đăng nhập
    const selectedUserID = selectedUser.IDNguoiDung; // ID của người dùng trong danh sách chọn

    if (!selectedUserID) {
      console.log("Thông tin người dùng cần chat không hợp lệ");
      return;
    }

    // Tạo roomId từ ID của người đăng nhập và người dùng đã chọn
    const newRoomId = `${currentUserID}-${selectedUserID}`;
    console.log("Room ID:", newRoomId);

    // Cập nhật roomId trong state và localStorage
    setRoomId(newRoomId);
    localStorage.setItem("roomId", newRoomId);

    // Tham gia vào phòng chat với roomId vừa tạo
    socket.emit("join-room", newRoomId);
    setSelectedUser(selectedUser); // Lưu thông tin người dùng đã chọn
  };

  return (
    <div className="chat-app">
      <button className="chat-icon" onClick={showChat}>
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

          <div className="sidebar-wrapper">
            <div className="sidebar-content">
              <div className="user-list">
                {loading ? (
                  <div>Đang tải...</div>
                ) : (
                  users.map((user) => {
                    if (!user || !user.IDNguoiDung || !user.HoTen) return null;
                    return (
                      <div
                        key={user.IDNguoiDung}
                        onClick={() => joinRoom(user)}
                        className="user-item"
                      >
                        <img
                          src={user.AnhDaiDien || "default-avatar.jpg"}
                          alt={user.HoTen}
                          className="avatar"
                        />
                        <span>{user.HoTen}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>{selectedUser.HoTen}</h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="close-chat"
            >
              ×
            </button>
          </div>

          <ol className="discussion">
            {dataChat?.map((item) => {
              const token = getToken();
              if (!token) return null;

              const infoUser: any = jwtDecode(token);
              if (!infoUser) return null;

              return (
                <li
                  key={item.IDNguoiDung}
                  className={
                    infoUser.user.IDNguoiDung === item.IDNguoiDung ? "self" : ""
                  }
                >
                  <div className="avatar">
                    <img
                      src="https://amp.businessinsider.com/images/5947f16889d0e20d5e04b3d9-750-562.jpg"
                      alt="User Avatar"
                    />
                  </div>
                  <div className="message-box">
                    <span>{item.content}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentMessage.trim() !== "") {
                const token = getToken();
                if (!token) {
                  console.log("Token không hợp lệ");
                  return;
                }

                const infoUser: any = jwtDecode(token);

                // Kiểm tra thông tin người dùng hiện tại
                if (!infoUser || !infoUser.data || !infoUser.data.id) {
                  console.log(
                    "Thông tin người dùng không hợp lệ hoặc không có ID"
                  );
                  return;
                }

                const currentUserID = infoUser.data.id; // Lấy ID người dùng đăng nhập

                const newChat = {
                  IDNguoiDung: currentUserID, // ID người dùng đăng nhập
                  Content: currentMessage, // Tin nhắn
                  RoomId: roomId, // ID phòng
                  NgayGui: new Date().toISOString().slice(0, 10), // Ngày gửi
                };

                console.log("Sending message:", newChat); // Log dữ liệu kiểm tra

                socket.emit("send-message", newChat); // Gửi dữ liệu qua socket

                setCurrentMessage(""); // Reset input sau khi gửi tin nhắn
              }
            }}
          >
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
