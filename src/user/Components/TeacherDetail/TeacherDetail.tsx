// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Table, Spin, message } from 'antd';
// import axios from 'axios';
// import { BASE_URL } from '../../../util/fetchfromAPI';

// const GiangVienDetailPage: React.FC = () => {
//   const { tenGiangVien } = useParams(); // Nhận tên giảng viên từ URL params
//   const [khoaHocList, setKhoaHocList] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchKhoaHocByGiangVien = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           message.error('Bạn cần đăng nhập để xem thông tin giảng viên.');
//           return;
//         }

//         const headers = { Authorization: `Bearer ${token}` };
//         const response = await axios.get(
//           `${BASE_URL}/giangvien?tenGiangVien=${tenGiangVien}`,
//           { headers }
//         );

//         if (response.data && response.data.length > 0) {
//           setKhoaHocList(response.data);
//         } else {
//           message.warning('Không có khóa học nào thuộc giảng viên này.');
//         }
//       } catch (error) {
//         console.error('Lỗi khi lấy dữ liệu giảng viên:', error);
//         message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchKhoaHocByGiangVien();
//   }, [tenGiangVien]);

//   const columns = [
//     {
//       title: 'Mã khóa học',
//       dataIndex: 'IDKhoaHoc',
//       key: 'IDKhoaHoc',
//     },
//   ];

//   return (
//     <div className="giangvien-detail-container">
//       <h2>Khóa học của giảng viên: {tenGiangVien}</h2>
//       {loading ? (
//         <Spin tip="Đang tải dữ liệu..." />
//       ) : (
//         <div>
//           {khoaHocList.length > 0 ? (
//             <Table
//               columns={columns}
//               dataSource={khoaHocList}
//               rowKey="IDKhoaHoc"
//               bordered
//               pagination={{ pageSize: 5 }}
//             />
//           ) : (
//             <p>Không có khóa học nào thuộc giảng viên này.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GiangVienDetailPage;
