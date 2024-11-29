import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Spin, message } from "antd";
import { BASE_URL } from "../../../util/fetchfromAPI";
import "../../../../public/user/css/hot-trending.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface Course {
  IDKhoaHoc: string;
  TenKhoaHoc: string;
  MoTaKhoaHoc: string;
  HinhAnh: string;
  SoLuongTichCuc: number;
  GiaTien: string;
}

const HotAndTrendingCourses: React.FC = () => {
  const [hotCourses, setHotCourses] = useState<Course[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const hotResponse = await axios.get(`${BASE_URL}/khoa-hoc/hot`, { headers });
      const trendingResponse = await axios.get(`${BASE_URL}/khoa-hoc/trending`, { headers });

      setHotCourses(hotResponse.data.content || []);
      setTrendingCourses(trendingResponse.data.content || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const sliderSettings = {
    dots: false,
    arrows: true,
    prevArrow: (
      <button className="slick-prev">
        <i className="fas fa-chevron-left"></i>
      </button>
    ),
    nextArrow: (
      <button className="slick-next">
        <i className="fas fa-chevron-right"></i>
      </button>
    ),
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return <Spin tip="Đang tải khóa học..." />;
  }

  return (
    <div>
      <h1>Khóa Học Hot</h1>
      {hotCourses.length > 0 ? (
        <Slider {...sliderSettings}>
          {hotCourses.map((course) => (
            <div key={course.IDKhoaHoc} className="course-card">
              {/* Thêm onClick để điều hướng */}
              <img
                src={course.HinhAnh}
                alt={course.TenKhoaHoc}
                onClick={() => navigate(`/khoa-hoc/xem-chi-tiet/${course.IDKhoaHoc}`)}
                style={{ cursor: "pointer" }}
              />
              <h3
                onClick={() => navigate(`/khoa-hoc/xem-chi-tiet/${course.IDKhoaHoc}`)}
                style={{ cursor: "pointer", color: "#0073e6" }}
              >
                {course.TenKhoaHoc}
              </h3>
              <p>{course.MoTaKhoaHoc}</p>
              <p>
                
                <i className="fas fa-thumbs-up" style={{ color: "#28a745", marginRight: "5px" }}></i>
                {course.SoLuongTichCuc}
              </p>
            </div>
          ))}
        </Slider>
      ) : (
        <p>Không có khóa học hot để hiển thị.</p>
      )}

      <h1>Khóa Học Xu Hướng</h1>
      {trendingCourses.length > 0 ? (
        <Slider {...sliderSettings}>
          {trendingCourses.map((course) => (
            <div key={course.IDKhoaHoc} className="course-card">
              {/* Thêm onClick để điều hướng */}
              <img
                src={course.HinhAnh}
                alt={course.TenKhoaHoc}
                onClick={() => navigate(`/khoa-hoc/xem-chi-tiet/${course.IDKhoaHoc}`)}
                style={{ cursor: "pointer" }}
              />
              <h3
                onClick={() => navigate(`/khoa-hoc/xem-chi-tiet/${course.IDKhoaHoc}`)}
                style={{ cursor: "pointer", color: "#0073e6" }}
              >
                {course.TenKhoaHoc}
              </h3>
              <p>{course.MoTaKhoaHoc}</p>             
              <p>
                
                <i className="fas fa-thumbs-up" style={{ color: "#28a745", marginRight: "5px" }}></i>
                {course.SoLuongTichCuc}
              </p>
            </div>
          ))}
        </Slider>
      ) : (
        <p>Không có khóa học xu hướng để hiển thị.</p>
      )}
    </div>
  );
};

export default HotAndTrendingCourses;
