import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../util/fetchfromAPI';
import '../../../public/admin/css/hashtag.css'
interface Course {
  IDKhoaHoc: number;
  TenKhoaHoc: string;
  MoTaKhoaHoc: string;
}

interface Hashtag {
  IDHashTag: number;
  HashTagName: string;
}

const CensorCourseHashtagPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API lấy danh sách khóa học
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/khoa-hoc`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCourses(response.data.content);
    } catch (err) {
      setError('Không thể lấy danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API lấy danh sách hashtag
  const fetchHashtags = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hashtag/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setHashtags(response.data.data);
    } catch (err) {
      setError('Không thể lấy danh sách hashtag');
    }
  };

  // Hàm thêm hashtag vào khóa học
  const addHashtagToCourse = async () => {
    if (selectedCourse === null || selectedHashtag === null) {
      alert('Vui lòng chọn khóa học và hashtag');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/hashtags/course/${selectedCourse}`,
        { HashTagName: hashtags.find(h => h.IDHashTag === selectedHashtag)?.HashTagName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Hashtag đã được thêm vào khóa học');
      fetchCourses(); // Cập nhật danh sách khóa học sau khi thêm hashtag
    } catch (err) {
      alert('Lỗi khi thêm hashtag vào khóa học');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCourses();
    fetchHashtags();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hashtag-course-management">
      <h1 className="heading-title">Danh sách khóa học</h1>

      {courses.length === 0 ? (
        <p className="no-course-message">Không có khóa học nào</p>
      ) : (
        <div className="course-table-container">
          <table className="course-list-table">
            <thead>
              <tr>
                <th>Tên khóa học</th>
                <th>Mô tả</th>
                <th>Thêm hashtag</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.IDKhoaHoc}>
                  <td className="course-name">{course.TenKhoaHoc}</td>
                  <td className="course-description">{course.MoTaKhoaHoc}</td>
                  <td className="hashtag-action">
                    <select
                      className="hashtag-select"
                      value={selectedCourse === course.IDKhoaHoc ? selectedHashtag : undefined}
                      onChange={(e) => setSelectedHashtag(Number(e.target.value))}
                    >
                      <option value="0">Chọn hashtag</option>
                      <option value="1">#khoahocnoibat</option>
                      <option value="2">#khoahochot</option>
                      <option value="3">#khoahocbanchay</option>
                    </select>

                    <button
                      className="add-hashtag-btn"
                      onClick={() => {
                        setSelectedCourse(course.IDKhoaHoc);
                        addHashtagToCourse();
                      }}
                    >
                      Thêm
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CensorCourseHashtagPage;
