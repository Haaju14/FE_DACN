// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import io from 'socket.io-client';
// import { BASE_URL } from '../../../util/fetchfromAPI';
// import '../../../../public/user/css/ChatBox.css';

// const socket = io("http://localhost:4000");

// const ChatApp: React.FC = () => {
//   const [users, setUsers] = useState<any[]>([]); // Danh sách người dùng
//   const [selectedUser, setSelectedUser] = useState<any | null>(null); // Người dùng được chọn
//   const [messages, setMessages] = useState<any[]>([]); // Tin nhắn
//   const [currentMessage, setCurrentMessage] = useState<string>(""); // Tin nhắn hiện tại
//   const [loading, setLoading] = useState<boolean>(false); // Trạng thái tải
//   const [sidebarVisible, setSidebarVisible] = useState<boolean>(false); // Trạng thái hiển thị sidebar

//   const getToken = () => localStorage.getItem("token");
//   const getRole = () => localStorage.getItem('role');

//   // Lấy danh sách người dùng theo vai trò
//   const fetchUsers = async () => {
//     try {
//       const token = getToken();  
//       const role = getRole();   
  
//       if (!token) {
//         console.error('Token không tồn tại');
//         alert("Vui lòng đăng nhập trước.");
//         return; // Ngừng thực hiện nếu không có token
//       }
  
//       if (!role) {
//         console.error('Role không tồn tại');
//         alert("Vui lòng kiểm tra quyền hạn của bạn.");
//         return; // Ngừng thực hiện nếu không có role
//       }
  
//       // Kiểm tra role hợp lệ
//       if (!['admin', 'giangvien', 'hocvien'].includes(role)) {
//         console.error('Role không hợp lệ');
//         alert("Quyền truy cập không hợp lệ.");
//         return; // Ngừng thực hiện nếu role không hợp lệ
//       }
  
      
//       if (role === 'admin') {
//         // Admin gọi danh sách giảng viên và học viên
//         const responseGiangVien = await axios.get(`${BASE_URL}/giangvien/all`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         const responseHocVien = await axios.get(`${BASE_URL}/hocvien`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         const allUsers = [
//           ...responseGiangVien.data,
//           ...responseHocVien.data,
//         ];
//         setUsers(allUsers); // Cập nhật danh sách người dùng
//         return;
  
//       } else if (role === 'giangvien') {
//         // Giảng viên gọi danh sách admin và học viên
//         const responseAdmin = await axios.get(`${BASE_URL}/admin`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         const responseHocVien = await axios.get(`${BASE_URL}/hocvien`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         const allUsers = [
//           ...responseAdmin.data,
//           ...responseHocVien.data,
//         ];
//         setUsers(allUsers); // Cập nhật danh sách người dùng
//         return;
        
//       } else if (role === 'hocvien') {
//         // Học viên chỉ lấy danh sách giảng viên
//         const responseGiangVien = await axios.get(`${BASE_URL}/giangvien/all`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         setUsers(responseGiangVien.data); // Cập nhật danh sách giảng viên
//         return;
//       }
//     } catch (error) {
//       console.error('Lỗi khi lấy danh sách người dùng:', error);
//       alert("Đã xảy ra lỗi khi tải dữ liệu người dùng.");
//     }
//   };
  

//   useEffect(() => {
//     fetchUsers(); // Gọi hàm lấy danh sách người dùng theo vai trò
//   }, []);

//   useEffect(() => {
//     socket.on('receive_message', (data) => {
//       setMessages(prevMessages => [...prevMessages, data]);
//     });

//     return () => {
//       socket.off('receive_message');
//     };
//   }, []);

//   useEffect(() => {
//     const userId = 1;
//     socket.emit('register', userId);
//   }, []);

//   const handleSendMessage = () => {
//     if (currentMessage.trim() && selectedUser) {
//       const message = { sender: "teacher", receiverId: selectedUser.IDNguoiDung, text: currentMessage };
//       socket.emit('send_message', message);
//       setMessages(prevMessages => [...prevMessages, message]);
//       setCurrentMessage("");
//     }
//   };

//   return (
//     <div className="chat-app">
//       {/* Nút mở sidebar */}
//       <button
//         className="chat-icon"
//         onClick={() => setSidebarVisible(true)}
//       >
//         <i className="gg-chat" />
//       </button>

//       {/* Sidebar */}
//       {sidebarVisible && (
//         <div className="sidebar show">
//           <button
//             className="sidebar-close"
//             onClick={() => setSidebarVisible(false)}
//           >
//             <strong>X</strong>
//           </button>

//           <div className="sidebar-logo">
//             <div className="logo-header" />
//           </div>

//           <div className="sidebar-wrapper">
//             <div className="sidebar-content">
//               <div className="user-list">
//                 {loading ? (
//                   <div>Đang tải...</div>
//                 ) : (
//                   users.map((user) => (
//                     <div
//                       key={user.IDNguoiDung}
//                       onClick={() => setSelectedUser(user)}
//                       className="user-item"
//                     >
//                       <img
//                         src={user.AnhDaiDien || "default-avatar.jpg"}
//                         alt={user.HoTen}
//                         className="avatar"
//                       />
//                       <span>{user.HoTen}</span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Khung chat */}
//       {selectedUser && (
//         <div className="chat-window">
//           <div className="chat-header">
//             <h3>Chat với {selectedUser.HoTen}</h3>
//             <button onClick={() => setSelectedUser(null)} className="close-chat">×</button>
//           </div>

//           <div className="messages">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={msg.sender === "teacher" ? "teacher-message" : "user-message"}
//               >
//                 <span>{msg.text}</span>
//               </div>
//             ))}
//           </div>

//           <div className="chat-footer">
//             <input
//               type="text"
//               value={currentMessage}
//               onChange={(e) => setCurrentMessage(e.target.value)}
//               placeholder="Nhập tin nhắn..."
//             />
//             <button onClick={handleSendMessage} className="send-button">➤</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatApp;
