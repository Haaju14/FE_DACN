import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { BASE_URL } from "../../../util/fetchfromAPI";
import Loading from "../Antd/Loading";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import '../../../../public/user/css/Teacher.css'

interface GiangVienData {
    IDNguoiDung: number;
    TenDangNhap: string;
    HoTen: string;
    Email: string;
    SDT: string;
    GioiTinh: string;
    AnhDaiDien: string;
}
interface KhoaHocData {
    IDKhoaHoc: number;
    TenKhoaHoc: string;
    MoTaKhoaHoc: string;
    HinhAnh: string;
    Video: string;
    NgayDang: string;
    LuotXem: number;
    GiamGia: number;
    GiaTien: string;
    LoaiKhoaHoc: string;
    IDDanhMuc: string;
    XepLoai: string;
}

const GiangVienComponent: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>(""); // Từ khóa tìm kiếm
    const [followedTeachers, setFollowedTeachers] = useState<number[]>([]);
    const navigate = useNavigate();

    // Lấy token từ localStorage
    const getToken = () => localStorage.getItem("token");

    // Lấy danh sách giảng viên
    const fetchGiangVienAPI = async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/giangvien/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data.content;
    };


    // API theo dõi giảng viên
    const followTeacherAPI = async (id: number) => {
        try {
            await axios.post(
                `${BASE_URL}/follow/${id}`,
                {},
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setFollowedTeachers((prev) => [...prev, id]);
            message.success("Đã theo dõi giảng viên.");
        } catch (error) {
            console.error("Error following teacher:", error);
            message.error("Có thể bạn đã follow giảng viên này rồi !!.");
        }
    };

    const { data: GiangVienList = [], isLoading, isError } = useQuery<GiangVienData[]>({
        queryKey: ["GiangVien"],
        queryFn: fetchGiangVienAPI,
    });

    // Lọc giảng viên theo từ khóa tìm kiếm
    const filteredTeachers = GiangVienList.filter((teacher) =>
        teacher.HoTen.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <div>Error loading teachers.</div>;
    }

    return (
        <section className="ftco-section bg-light">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 custom-sidebar">
                        <div className="custom-sidebar-wrap bg-light ftco-animate">
                            <form action="#">
                                <div className="fields">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm kiếm giảng viên theo tên"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="teacher-list">
                            {filteredTeachers.map((teacher) => (
                                <div className="teacher-item" key={teacher.IDNguoiDung}>
                                    <img src={teacher.AnhDaiDien} alt={teacher.HoTen} />
                                    <div className="teacher-info">
                                        <h3>{teacher.HoTen}</h3>
                                        <p>Email: {teacher.Email}</p>
                                        <p>Giới tính: {teacher.GioiTinh}</p>
                                        <p>Số điện thoại: {teacher.SDT}</p>
                                    </div>
                                    <button
                                        className={`follow-button ${followedTeachers.includes(teacher.IDNguoiDung) ? "followed" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            followTeacherAPI(teacher.IDNguoiDung);
                                        }}
                                    >
                                        {followedTeachers.includes(teacher.IDNguoiDung) ? (
                                            <HeartFilled className="heart-icon" />
                                        ) : (
                                            <HeartOutlined className="heart-icon" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
};

export default GiangVienComponent;
