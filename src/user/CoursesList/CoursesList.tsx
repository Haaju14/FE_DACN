import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { BASE_URL } from "../../util/fetchfromAPI";
import Loading from "../Components/Antd/Loading";
import '../../../public/user/css/style.css'

interface KhoaHocData {
    IDKhoaHoc: number;
    TenKhoaHoc: string;
    MoTaKhoaHoc: string;
    HinhAnh: string;
    NgayDang: string;
    LuotXem: number;
    GiamGia: string;
    GiaTien: string;
    LoaiKhoaHoc: string;
}

const KhoaHocCombinedComponent: React.FC = () => {
    const [favoriteCourses, setFavoriteCourses] = useState<number[]>([]);
    const [registeredCourses, setRegisteredCourses] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(""); // Từ khóa tìm kiếm
    const [selectedType, setSelectedType] = useState<string>(""); // Loại khóa học
    const navigate = useNavigate();

    // Lấy danh sách khóa học
    const fetchKhoaHocAPI = async () => {
        const { data } = await axios.get(`${BASE_URL}/khoa-hoc`);
        return data.content;
    };

    // Lấy danh sách khóa học đã đăng ký
    const fetchRegisteredCoursesAPI = async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/khoa-hoc-dang-ky`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data.content.map((item: { IDKhoaHoc: number }) => item.IDKhoaHoc);
    };

    // Lấy danh sách khóa học yêu thích
    const fetchFavoriteCoursesAPI = async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data.content.map((item: { IDKhoaHoc: number }) => item.IDKhoaHoc);
    };

    const { data: KhoaHocList = [], isLoading, isError } = useQuery<KhoaHocData[]>({
        queryKey: ["KhoaHoc"],
        queryFn: fetchKhoaHocAPI,
    });

    const { data: favoriteCoursesData = [], isLoading: isLoadingFavorites } = useQuery<number[]>({
        queryKey: ["favoriteCourses"],
        queryFn: fetchFavoriteCoursesAPI,
    });

    const { data: registeredCoursesData = [], isLoading: isLoadingRegistered } = useQuery<number[]>({
        queryKey: ["registeredCourses"],
        queryFn: fetchRegisteredCoursesAPI,
    });

    useEffect(() => {
        if (!isLoadingFavorites && favoriteCoursesData.length > 0) {
            setFavoriteCourses(favoriteCoursesData);
        }
    }, [isLoadingFavorites, favoriteCoursesData]);

    useEffect(() => {
        if (!isLoadingRegistered && registeredCoursesData.length > 0) {
            setRegisteredCourses(registeredCoursesData);
        }
    }, [isLoadingRegistered, registeredCoursesData]);

    // Điều hướng đến chi tiết khóa học
    const handleViewDetails = (id: number) => {
        navigate(`/khoa-hoc/xem-chi-tiet/${id}`);
    };

    // Toggle yêu thích
    const toggleFavoritesCourseAPI = async (id: number) => {
        if (favoriteCourses.includes(id)) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${BASE_URL}/favorites/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavoriteCourses((prev) => prev.filter(courseId => courseId !== id));
                message.success("Đã xóa khóa học khỏi danh sách yêu thích.");
            } catch (error) {
                console.error("Error removing favorite course:", error);
                message.error("Có lỗi xảy ra khi xóa khỏi yêu thích.");
            }
        } else {
            try {
                const token = localStorage.getItem("token");
                await axios.post(
                    `${BASE_URL}/favorite/add/${id}`,
                    { IDNguoiDung: 1, IDKhoaHoc: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFavoriteCourses((prev) => [...prev, id]);
                message.success("Đã thêm khóa học vào yêu thích.");
            } catch (error) {
                console.error("Error adding favorite course:", error);
                message.error("Có lỗi xảy ra khi thêm vào yêu thích.");
            }
        }
    };

    // Lọc khóa học theo từ khóa tìm kiếm và loại khóa học
    const filteredCourses = KhoaHocList.filter((KhoaHoc) => {
        const isInFavoriteOrRegistered =
            favoriteCourses.includes(KhoaHoc.IDKhoaHoc) || registeredCourses.includes(KhoaHoc.IDKhoaHoc);

        const matchesSearchTerm =
            KhoaHoc.TenKhoaHoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            KhoaHoc.MoTaKhoaHoc.toLowerCase().includes(searchTerm.toLowerCase()); // Tìm kiếm trong tên và mô tả

        const matchesType =
            selectedType === "Like" ? favoriteCourses.includes(KhoaHoc.IDKhoaHoc) :
                selectedType === "Registed" ? registeredCourses.includes(KhoaHoc.IDKhoaHoc) : true;

        return isInFavoriteOrRegistered && matchesSearchTerm && matchesType;
    });

    if (isLoading || isLoadingFavorites || isLoadingRegistered) {
        return <Loading />;
    }

    if (isError) {
        return <div>Error loading courses.</div>;
    }

    return (
        <section className="ftco-section bg-light">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 custom-sidebar">
                        <div className="custom-sidebar-wrap bg-light ftco-animate">
                            <form action="#">
                                <div className="custom-fields">
                                    <div className="custom-form-group">
                                        <input
                                            type="text"
                                            className="custom-form-control"
                                            placeholder="Tìm kiếm khóa học theo tên"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <span>Danh sách khóa học</span>
                                    <div className="custom-form-group">
                                        <div className="custom-select-wrap one-third">
                                            <select
                                                className="custom-form-control"
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                            >
                                                <option value="">Tất cả khóa học</option>
                                                <option value="Like">Khóa học đã yêu thích</option>
                                                <option value="Registed">Khóa học đã đăng ký</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>


                    <div className="col-md-8">
                        <div className="khoa-hoc-list">
                            <div className="row">
                                {filteredCourses.map((KhoaHoc) => (
                                    <div className="col-md-4" key={KhoaHoc.IDKhoaHoc}>
                                        <div className="khoa-hoc-item" style={{ marginLeft:"50px" }}>
                                            {/* Hình ảnh khóa học, nhấp vào để xem chi tiết */}
                                            <img
                                                src={KhoaHoc.HinhAnh}
                                                alt={KhoaHoc.TenKhoaHoc}
                                                onClick={() => handleViewDetails(KhoaHoc.IDKhoaHoc)}  // Thêm sự kiện click vào ảnh
                                                style={{ cursor: "pointer", width: "100%", height: "auto", maxHeight: "200px", objectFit: "cover" }}
                                            />
                                            <p>

                                            </p>
                                            {/* Tên khóa học, nhấp vào để xem chi tiết */}
                                            <h3
                                                onClick={() => handleViewDetails(KhoaHoc.IDKhoaHoc)}  // Thêm sự kiện click vào tên khóa học
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "1.1rem",
                                                    color: "#007bff",
                                                    fontWeight: "bold",
                                                    textTransform: "capitalize",
                                                    marginBottom: "10px",
                                                    marginTop: "5px",
                                                }}
                                                title={KhoaHoc.TenKhoaHoc}
                                            >
                                                {KhoaHoc.TenKhoaHoc}
                                            </h3>

                                            {/* <p><strong>{KhoaHoc.IDHashTag}</strong></p> */}

                                            <p style={{ color: "#333", fontSize: "1rem" }}>
                                                <strong>Ngày đăng: </strong>
                                                {KhoaHoc.NgayDang}
                                            </p>

                                            <p style={{ color: "#333", fontSize: "1rem" }}>
                                                <strong>Lượt xem: </strong>
                                                {KhoaHoc.LuotXem}
                                            </p>

                                            <p style={{ color: "#333", fontSize: "1rem" }}>
                                                <strong>Giảm giá: </strong>
                                                {KhoaHoc.GiamGia || "0"}%
                                            </p>

                                            {/* <p><strong>Loại: </strong>{KhoaHoc.LoaiKhoaHoc}</p> */}
                                            <p style={{ color: "#333", fontSize: "1rem" }}>
                                                <strong>Giá: </strong>
                                                {parseFloat(KhoaHoc.GiamGia) > 0 ? (
                                                    <>
                                                        <span style={{ textDecoration: "line-through", color: "red" }}>
                                                            {parseFloat(KhoaHoc.GiaTien).toFixed(0)} VND
                                                        </span>
                                                        {" "}
                                                        <strong style={{ color: "green" }}>
                                                            {(
                                                                parseFloat(KhoaHoc.GiaTien) -
                                                                (parseFloat(KhoaHoc.GiaTien) * parseFloat(KhoaHoc.GiamGia) / 100)
                                                            ).toFixed(0)}{" "}VND
                                                        </strong>

                                                    </>
                                                ) : (
                                                    <strong style={{ color: "green" }} >{parseFloat(KhoaHoc.GiaTien).toFixed(0)} VND</strong>
                                                )}
                                            </p>

                                            <div className="button-group">


                                                <span
                                                    onClick={() => toggleFavoritesCourseAPI(KhoaHoc.IDKhoaHoc)}
                                                    style={{ cursor: "pointer", fontSize: "24px" }}
                                                >
                                                    {favoriteCourses.includes(KhoaHoc.IDKhoaHoc) ? (
                                                        <HeartFilled style={{ color: "red" }} />
                                                    ) : (
                                                        <HeartOutlined />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KhoaHocCombinedComponent;
