import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../util/fetchfromAPI";
import "../../../../public/user/css/ChatBox.css";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useRef } from "react";

const socket = io("ws://localhost:8081");

interface CourseRoom {
  HinhAnh: string;
  IDKhoaHoc: string;
  TenKhoaHoc: string;
  RoomId: string;
  GiangVien: {
    HoTen: string;
    AnhDaiDien?: string;
  };
}

interface GiangVien {
  IDNguoiDung: string;
  HoTen: string;
  AnhDaiDien?: string;
}

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
  const [courseRooms, setCourseRooms] = useState<CourseRoom[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [isCourseChat, setIsCourseChat] = useState(false); //add mới

  // Hàm fetch danh sách khóa học đã đăng ký (mới)
  const fetchRegisteredCourses = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/khoa-hoc-dang-ky`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.content) {
        setCourseRooms(response.data.content);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học:", error);
    }
  };

  // Hàm join vào room chat của khóa học (mới)
  const joinCourseRoom = async (course: CourseRoom) => {
    const token = getToken();
    if (!token) return;

    try {
      // Thêm listener tạm thời cho lỗi
      const errorHandler = (errorMsg: string) => {
        alert(errorMsg);
        socket.off("join-error", errorHandler);
      };
      socket.on("join-error", errorHandler);

      // Gửi yêu cầu tham gia phòng với ID khóa học
      socket.emit("join-rooms", course.IDKhoaHoc);

      // Sử dụng RoomId từ props nếu có
      const finalRoomId = course.RoomId;
      if (!finalRoomId) throw new Error("Không xác định được RoomId");

      setRoomId(finalRoomId);
      localStorage.setItem("roomId", finalRoomId);
      setIsCourseChat(true);

      setSelectedUser({
        IDKhoaHoc: course.IDKhoaHoc,
        HoTen: course.TenKhoaHoc,
        AnhDaiDien: course.HinhAnh || "default-course.jpg",
        GiangVien: course.GiangVien,
      });

      // Xóa listener sau 5s
      setTimeout(() => socket.off("join-error", errorHandler), 5000);
    } catch (error) {
      console.error("Lỗi khi tham gia phòng học:", error);
      alert("Không thể tham gia phòng chat. Vui lòng thử lại sau.");
    }
  };

  // Hàm gửi tin nhắn nhóm (MỚI)
  const sendCourseMessage = () => {
    if (!currentMessage.trim() || !selectedUser?.IDKhoaHoc || !roomId) return;

    const token = getToken();
    if (!token) return;

    const userInfo = decodeUser();
    if (!userInfo?.data?.id) return;

    socket.emit("send-course-message", {
      IDNguoiDung: userInfo.data.id,
      Content: currentMessage,
      RoomId: roomId,
      NgayGui: new Date().toISOString(),
    });

    setCurrentMessage("");
  };

  useEffect(() => {
    fetchRegisteredCourses();
    fetchUsers();
  }, []);

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
        const responseAdmin = await axios.get(`${BASE_URL}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminData = Array.isArray(responseAdmin.data.content)
          ? responseAdmin.data.content
          : [];
        const giangVienData = Array.isArray(responseGiangVien.data.content)
          ? responseGiangVien.data.content
          : [];
        allUsers = [...adminData, ...giangVienData];
      }

      setUsers(allUsers);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    // Lắng nghe tin nhắn từ socket
    socket.on(
      "sv-send-mess",
      ({ content, IDNguoiDung, RoomId: receivedRoomId, NgayGui }) => {
        if (receivedRoomId === roomId) {
          setDataChat((prevChats) => [
            ...prevChats,
            {
              Content: content,
              IDNguoiDung,
              NgayGui,
            },
          ]);
        }
      }
    );

    // Lắng nghe dữ liệu chat khi join room
    socket.on("data-chat", (data) => {
      setDataChat(data);
    });

    return () => {
      socket.off("sv-send-mess");
      socket.off("data-chat");
    };
  }, [roomId]);

  const showChat = () => {
    setSidebarVisible(true);
  };

  const joinRoom = (selectedUser: any) => {
    const token = getToken();
    if (!token) return;

    const infoUser: any = jwtDecode(token);
    if (!infoUser?.data?.id) return;

    const currentUserID = infoUser.data.id;
    const selectedUserID = selectedUser.IDNguoiDung;

    if (!selectedUserID) return;

    const newRoomId =
      currentUserID < selectedUserID
        ? `${currentUserID}-${selectedUserID}`
        : `${selectedUserID}-${currentUserID}`;

    setRoomId(newRoomId);
    localStorage.setItem("roomId", newRoomId);

    socket.emit("join-room", newRoomId);
    setSelectedUser(selectedUser);
  };

  useEffect(() => {
    if (discussionRef.current) {
      discussionRef.current.scrollTop = discussionRef.current.scrollHeight;
    }
  }, [dataChat]);

  // form gửi tin nhắn (MỚI)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() === "" || !roomId) return;

    if (isCourseChat) {
      sendCourseMessage();
    } else {
      const token = getToken();
      if (!token) return;

      const infoUser: any = jwtDecode(token);
      if (!infoUser?.data?.id) return;

      const newChat = {
        IDNguoiDung: infoUser.data.id,
        Content: currentMessage,
        RoomId: roomId,
        NgayGui: new Date().toISOString(),
      };

      socket.emit("send-message", newChat);
      setCurrentMessage("");
    }
  };

  return (
    <div className="chat-app">
      <button className="chatbox-toggle" onClick={showChat}>
        <i className="gg-chat" />
      </button>

      {sidebarVisible && (
        <div className="sidebar-panel show-sidebar">
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarVisible(false)}
          >
            <strong>X</strong>
          </button>

          <div className="sidebar-inner">
            <div className="sidebar-tabs">
              <button
                className={activeTab === "users" ? "active" : ""}
                onClick={() => setActiveTab("users")}
              >
                Người dùng
              </button>
              <button
                className={activeTab === "courses" ? "active" : ""}
                onClick={() => setActiveTab("courses")}
              >
                Khóa học của tôi
              </button>
            </div>

            <div className="sidebar-user-list">
              {loading ? (
                <div>Đang tải...</div>
              ) : activeTab === "users" ? (
                users.map((user) => (
                  <div
                    key={user.IDNguoiDung}
                    onClick={() => joinRoom(user)}
                    className="sidebar-user-item"
                  >
                    <img
                      src={user.AnhDaiDien || "default-avatar.jpg"}
                      alt={user.HoTen}
                      className="avatar"
                    />
                    <span>{user.HoTen}</span>
                  </div>
                ))
              ) : (
                courseRooms.map((course) => (
                  <div
                    key={`course-${course.IDKhoaHoc}`}
                    onClick={() => joinCourseRoom(course)}
                    className="sidebar-user-item"
                  >
                    <img
                      src={course.HinhAnh || "default-course.jpg"}
                      alt={course.TenKhoaHoc}
                      className="avatar"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "default-course.jpg";
                      }}
                    />
                    <div className="chatbox-user-info">
                      <small className="chatbox-username">{course.TenKhoaHoc}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="chatbox-window">
          <div className="chatbox-header">
            <div className="chatbox-header-info">
              <img
                src={selectedUser.AnhDaiDien ||
                  (selectedUser.IDKhoaHoc ? "default-course.jpg" : "default-avatar.jpg")}
                alt={selectedUser.HoTen}
                className="chatbox-avatar"
              />
              <div className="chatbox-user-info">
                <h3 className="chatbox-username">{selectedUser.HoTen}</h3>
                {selectedUser.GiangVien && (
                  <small className="chatbox-user-detail">
                    Giảng viên: {selectedUser.GiangVien.HoTen}
                  </small>
                )}
                {isCourseChat && (
                  <span className="chatbox-user-detail">Nhóm khóa học</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setRoomId(null);
                setIsCourseChat(false);
                localStorage.removeItem("roomId");
              }}
              className="chatbox-close-btn"
              aria-label="Đóng chat"
            >
              ×
            </button>
          </div>

          <ol className="chat-messages" ref={discussionRef}>
            {dataChat.map((item, index) => {
              const token = getToken();
              if (!token) return null;

              const infoUser: any = jwtDecode(token);
              const isCurrentUser = infoUser?.data?.id === item.IDNguoiDung;

              return (
                <li
                  key={`${item.IDNguoiDung}-${index}`}
                  className={isCurrentUser ? "self" : "other"}
                >
                  {!isCurrentUser && !isCourseChat && (
                    <img
                      src={item.AnhDaiDien || "default-avatar.jpg"}
                      alt="Avatar"
                      className="message-avatar"
                    />
                  )}
                  <div
                    className={`message-box ${isCurrentUser ? "self" : "other"
                      }`}
                  >
                    {!isCurrentUser && isCourseChat && (
                      <div className="message-sender">
                        {item.HoTen ||
                          users.find(u => u.IDNguoiDung === item.IDNguoiDung)?.HoTen ||
                          "Thành viên"}
                      </div>
                    )}
                    <span>{item.Content}</span>
                    <div className="message-time">
                      {new Date(item.NgayGui).toLocaleTimeString()}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <form className="chatbox-form" onSubmit={handleSubmit}>
            <div className="chatbox-input-wrapper">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="chatbox-input"
              />
            </div>
            <div className="chatbox-send-btn-wrapper">
              <button type="submit" className="send-message-btn">
                Gửi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
