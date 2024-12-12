import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../util/fetchfromAPI';
import '../../../public/admin/css/censor.css'

interface Course {
  IDKhoaHoc: number;
  TenKhoaHoc: string;
  MoTaKhoaHoc: string;
  HinhAnh: string;
  IDNguoiDung: number;
}

const CensorCoursePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API lấy danh sách khóa học chưa duyệt
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/khoa-hoc-kiem-duyet`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      // Kiểm tra nếu không có khóa học nào
      if (response.data.content.length === 0) {
        setError('Không có khóa học đang chờ duyệt');
      } else {
        setCourses(response.data.content);
      }
    } catch (err) {
      setError('Không thể lấy danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };
  

  // Hàm xử lý duyệt khóa học
  const approveCourse = async (idKhoaHoc: number) => {
    try {
      console.log('ID khóa học cần duyệt: ', idKhoaHoc);
      await axios.post(
        `${BASE_URL}/kiem-duyet-khoa-hoc`,
        { idKhoaHoc, trangThai: 'duyet' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Khóa học đã được duyệt');
      fetchCourses(); // Cập nhật danh sách sau khi duyệt
    } catch (err) {
      alert('Lỗi khi duyệt khóa học');
    }
  };

  // Hàm xử lý từ chối khóa học
  const rejectCourse = async (idKhoaHoc: number) => {
    const lyDo = prompt('Vui lòng nhập lý do từ chối:');
    if (!lyDo) {
      alert('Cần phải nhập lý do từ chối');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/kiem-duyet-khoa-hoc`,
        { idKhoaHoc, trangThai: 'tu_choi', lyDo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Khóa học đã bị từ chối');
      fetchCourses(); // Cập nhật danh sách sau khi từ chối
    } catch (err) {
      alert('Lỗi khi từ chối khóa học');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="censor-course-page">
      <h1 className="page-title">Danh sách khóa học chưa duyệt</h1>
      {courses.length === 0 ? (
        <p className="no-courses">Không có khóa học nào cần duyệt.</p>
      ) : (
        <table className="course-table">
          <thead>
            <tr>
              <th>Tên khóa học</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.IDKhoaHoc}>
                <td>{course.TenKhoaHoc}</td>
                <td>{course.MoTaKhoaHoc}</td>
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => approveCourse(course.IDKhoaHoc)}
                  >
                    Duyệt
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => rejectCourse(course.IDKhoaHoc)}
                  >
                    Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CensorCoursePage;
