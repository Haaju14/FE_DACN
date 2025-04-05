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
const ChatApp: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  const [dataChat, setDataChat] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCourseChat, setIsCourseChat] = useState(false); //add mới
  const discussionRef = useRef<HTMLOListElement | null>(null);

  const getToken = () => localStorage.getItem("token");
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
    } catch (error) { }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("connect", () => { });
    // Lắng nghe tin nhắn từ socket
    socket.on(
      "sv-send-mess",
      ({ content, IDNguoiDung, RoomId: receivedRoomId, NgayGui }) => {
        if (receivedRoomId === roomId) {
          setDataChat((prevChats) => [
            ...prevChats,
            {
              Content: content,
              IDNguoiDung: IDNguoiDung,
              NgayGui: NgayGui,
            },
          ]);
        }
      }
    );

    return () => {
      socket.off("sv-send-mess");
      socket.off("send-message");
    };
  }, [roomId]);

  const showChat = () => {
    setSidebarVisible(true);
  };

  useEffect(() => { }, [sidebarVisible]);

  const joinRoom = (selectedUser: any) => {
    const token = getToken();
    if (!token) {
      return;
    }
    const infoUser: any = jwtDecode(token);

    if (!infoUser || !infoUser.data || !infoUser.data.id) {
      return;
    }

    const currentUserID = infoUser.data.id;
    const selectedUserID = selectedUser.IDNguoiDung;

    if (!selectedUserID) {
      return;
    }

    const newRoomId =
      currentUserID < selectedUserID
        ? `${currentUserID}-${selectedUserID}`
        : `${selectedUserID}-${currentUserID}`;

    console.log("Tham gia phòng:", newRoomId);
    setRoomId(newRoomId);
    localStorage.setItem("roomId", newRoomId);

    socket.emit("join-room", newRoomId);
    setSelectedUser(selectedUser); // Lưu avatar và tên người chọn vào state
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
            <div className="sidebar-user-list">
              {loading ? (
                <div>Đang tải...</div>
              ) : (
                users.map((user) => {
                  if (!user || !user.IDNguoiDung || !user.HoTen) return null;
                  return (
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
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="chatbox-window">
          <div className="chatbox-header">
            <div className="chatbox-header-info">
              {/* Hiển thị avatar và tên người dùng */}
              <img
                src={selectedUser.AnhDaiDien || "default-avatar.jpg"}
                alt={selectedUser.HoTen}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <h3>{selectedUser.HoTen}</h3>
            </div>
            <button onClick={() => setSelectedUser(null)} className="chatbox-close-btn">
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
                  className={isCurrentUser ? "self" : "other"} // Phân biệt giữa người gửi và đối phương
                >
                  <div className={`message-box ${isCurrentUser ? "self" : "other"}`}>
                    <span>{item.Content}</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <form
            className="chatbox-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (currentMessage.trim() !== "") {
                const token = getToken();
                if (!token) {
                  return;
                }

                const infoUser: any = jwtDecode(token);

                if (!infoUser || !infoUser.data || !infoUser.data.id || !roomId) {
                  return;
                }

                const currentUserID = infoUser.data.id;

                const newChat = {
                  IDNguoiDung: currentUserID,
                  Content: currentMessage,
                  RoomId: roomId,
                  NgayGui: new Date().toISOString().slice(0, 10),
                };
                console.log("Payload gửi tin nhắn:", newChat);

                // Gửi tin nhắn qua socket
                socket.emit("send-message", newChat);

                // Sau khi gửi tin nhắn, reset lại giá trị currentMessage
                setCurrentMessage("");
              }
            }}
          >
            <div className="chatbox-input-wrapper">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a message"
                className="chatbox-input"
              />
            </div>
            <div className="chatbox-send-btn-wrapper">
              <button type="submit" className="send-message-btn">
                Send
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ChatApp;
