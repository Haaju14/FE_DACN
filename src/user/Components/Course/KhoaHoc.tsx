import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Antd/Loading";
import { BASE_URL } from "../../../util/fetchfromAPI";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import '../../../../public/user/css/KhoaHoc.css'

interface KhoaHocData {
    IDKhoaHoc: number;
    TenKhoaHoc: string;
    MoTaKhoaHoc: string;
    HinhAnh: string;
    Video: string;
    NgayDang: string;
    LuotXem: number;
    GiamGia: string;
    GiaTien: string;
    LoaiKhoaHoc: string;
    IDDanhMuc: string;
    XepLoai: string;
    IDHashTag: number;
}

const KhoaHocComponent: React.FC = () => {
    const [selectedType, setSelectedLocation] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [favoriteCourses, setFavoriteCourses] = useState<number[]>([]);
    const [showFavoriteOnly,] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchKhoaHocAPI = async () => {
        const { data } = await axios.get(`${BASE_URL}/khoa-hoc`);
        return data.content;
    };

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

    useEffect(() => {
        if (!isLoadingFavorites && favoriteCoursesData.length > 0) {
            setFavoriteCourses(favoriteCoursesData);
        }
    }, [isLoadingFavorites, favoriteCoursesData]);

    const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(event.target.value);
    };

    const handleViewDetails = (id: number) => {
        navigate(`/khoa-hoc/xem-chi-tiet/${id}`);
    };


    const toggleFavoritesCourseAPI = async (id: number) => {
        if (favoriteCourses.includes(id)) {
            // Nếu khóa học đã được yêu thích, tiến hành xóa
            try {
                const token = localStorage.getItem("token");
                await axios.delete(
                    `${BASE_URL}/favorites/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFavoriteCourses((prev) => prev.filter(courseId => courseId !== id));
                message.success("Đã xóa khóa học khỏi danh sách yêu thích.");
            } catch (error) {
                console.error("Error removing favorite course:", error);
                message.error("Có lỗi xảy ra khi xóa khỏi yêu thích.");
            }
        } else {
            // Nếu khóa học chưa được yêu thích, tiến hành thêm vào danh sách yêu thích
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
    // hàm thêm khóa học vào giỏ hàng
    const addToCart = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${BASE_URL}/don-hang/add/${id}`, // Thêm IDKhoaHoc vào URL
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success("Đã thêm khóa học vào giỏ hàng.");
        } catch (error) {
            console.error("Error adding course to cart:", error);
            message.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
        }
    };



    if (isLoading || isLoadingFavorites) {
        return <Loading />;
    }

    if (isError) {
        return <div>Error loading courses.</div>;
    }

    const filteredKhoaHocList = KhoaHocList.filter((KhoaHoc) => {
        return (
            KhoaHoc.TenKhoaHoc.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedType === "" || KhoaHoc.LoaiKhoaHoc === selectedType) &&
            (selectedCategory === "" || KhoaHoc.IDDanhMuc.toString() === selectedCategory) &&
            (!showFavoriteOnly || favoriteCourses.includes(KhoaHoc.IDKhoaHoc)) // Điều kiện tìm kiếm khóa học yêu thích
        );
    });


    return (
        <section className="ftco-section bg-light">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 custom-sidebar">
                        <div className="custom-sidebar-wrap bg-light ftco-animate">
                            <form action="#">
                                <div className="fields">
                                    <h3 className="custom-heading mb-4">Tìm kiếm nâng cao</h3>
                                    <span>Tìm kiếm theo tên</span>
                                    <div className="custom-form-group">
                                        <input
                                            type="text"
                                            className="custom-form-control"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                    <span>Loại khóa học</span>
                                    <div className="custom-form-group">
                                        <div className="custom-select-wrap one-third">
                                            <select
                                                className="custom-form-control"
                                                value={selectedType}
                                                onChange={handleTagChange}
                                            >
                                                <option value="">Tất cả loại khóa học</option>
                                                <option value="mien_phi">Miễn phí</option>
                                                <option value="tra_phi">Trả phí</option>
                                            </select>
                                        </div>
                                    </div>
                                    <span>Danh mục khóa học</span>
                                    <div className="custom-form-group">
                                        <div className="custom-select-wrap one-third">
                                            <select
                                                className="custom-form-control"
                                                value={selectedCategory}
                                                onChange={handleCategoryChange}
                                            >
                                                <option value="">Tất cả danh mục</option>
                                                <option value="1">Lập trình Java</option>
                                                <option value="2">Lập trình Python</option>
                                                <option value="3">Phát triển Web</option>
                                                <option value="4">Lập trình C#</option>
                                                <option value="5">Khoa học Dữ liệu</option>
                                                <option value="6">Trí tuệ Nhân tạo</option>
                                                <option value="7">Phát triển Ứng dụng Di động</option>
                                                <option value="8">An ninh Mạng</option>
                                                <option value="9">Phân tích Dữ liệu</option>
                                                <option value="10">Máy học</option>
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="khoa-hoc-list">
                            <div className="row">
                                {filteredKhoaHocList.map((KhoaHoc) => (
                                    <div className="col-md-4" key={KhoaHoc.IDKhoaHoc}>
                                        <div className="khoa-hoc-item">
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
                                                    onClick={() => addToCart(KhoaHoc.IDKhoaHoc)}
                                                    style={{ cursor: "pointer", fontSize: "24px", }}
                                                >
                                                    <ShoppingCartOutlined />
                                                </span>

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

export default KhoaHocComponent;
