import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../util/fetchfromAPI";
import "../../../../public/user/css/ChatBox.css";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useRef } from "react";

const socket = io("ws://localhost:8081");

const ChatApp: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  const [dataChat, setDataChat] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  const discussionRef = useRef<HTMLOListElement | null>(null);

  const getToken = () => localStorage.getItem("token");

  const decodeUser = () => {
    const token = getToken();
    if (token) {
      try {
        return jwtDecode<any>(token);
      } catch (error) {
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
    } catch (error) {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {});
    // Lắng nghe tin nhắn từ socket
    socket.on("sv-send-mess", ({ message, userId, roomId: receivedRoomId }) => {
      if (!message || !userId || !receivedRoomId) return;

      if (receivedRoomId === roomId) {
        setDataChat((prev) => [
          ...prev,
          { content: message, IDNguoiDung: userId },
        ]);
      }
    });

    socket.on("send-message", (newChat) => {
      if (newChat.roomId === roomId) {
        setDataChat((prev) => [...prev, newChat]);
      }
    });

    return () => {
      socket.off("sv-send-mess");
      socket.off("send-message");
    };
  }, [roomId]);

  const showChat = () => {
    setSidebarVisible(true);
  };

  useEffect(() => {}, [sidebarVisible]);

  const joinRoom = (selectedUser: any) => {
    const token = getToken();
    if (!token) {
      return;
    }
    const infoUser: any = jwtDecode(token);

    // Kiểm tra xem thông tin người dùng đăng nhập có hợp lệ không
    if (!infoUser || !infoUser.data || !infoUser.data.id) {
      return;
    }

    // Lấy ID của người đăng nhập và ID người dùng đã chọn
    const currentUserID = infoUser.data.id; // ID người dùng đăng nhập
    const selectedUserID = selectedUser.IDNguoiDung; // ID của người dùng trong danh sách chọn

    if (!selectedUserID) {
      return;
    }

    // Tạo roomId từ ID của người đăng nhập và người dùng đã chọn, luôn đảm bảo ID nhỏ hơn trước
    const newRoomId =
      currentUserID < selectedUserID
        ? `${currentUserID}-${selectedUserID}`
        : `${selectedUserID}-${currentUserID}`;

    // Cập nhật roomId trong state và localStorage
    setRoomId(newRoomId);
    localStorage.setItem("roomId", newRoomId);

    // Tham gia vào phòng chat với roomId vừa tạo
    socket.emit("join-room", newRoomId);
    setSelectedUser(selectedUser);
  };

  useEffect(() => {
    // Lắng nghe sự kiện "data-chat" từ server
    socket.on("data-chat", (data) => {
      setDataChat(data); // Cập nhật lại dữ liệu chat trong state
    });

    // Cleanup listener khi component unmount
    return () => {
      socket.off("data-chat");
    };
  }, []);

  useEffect(() => {
    if (discussionRef.current) {
      discussionRef.current.scrollTop = discussionRef.current.scrollHeight;
    }
  }, [dataChat]);

  return (
    // <div className="chat-window">
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

          <ol className="discussion" ref={discussionRef}>
            {dataChat.map((item, index) => {
              const token = getToken();
              if (!token) return null;

              const infoUser: any = jwtDecode(token);

              return (
                <li
                  key={`${item.IDNguoiDung}-${index}`}
                  className={
                    infoUser?.data?.id === item.IDNguoiDung ? "self" : ""
                  }
                >
                  <div className="avatar">
                    <img
                      src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                      alt="User Avatar"
                      style={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <div className="message-box">
                    <span>{item.Content}</span>
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
                  return;
                }

                const infoUser: any = jwtDecode(token);

                // Kiểm tra thông tin người dùng hiện tại
                if (!infoUser || !infoUser.data || !infoUser.data.id) {
                  return;
                }

                const currentUserID = infoUser.data.id;

                const newChat = {
                  IDNguoiDung: currentUserID,
                  Content: currentMessage,
                  RoomId: roomId,
                  NgayGui: new Date().toISOString().slice(0, 10),
                };

                socket.emit("send-message", newChat);

                setDataChat((prev) => [
                  ...prev,
                  { Content: currentMessage, IDNguoiDung: currentUserID },
                ]);

                setCurrentMessage("");
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
    // </div>
  );
};

export default ChatApp;
