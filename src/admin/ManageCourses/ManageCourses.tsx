import React, { useState, useEffect } from "react";
import axios from "axios";
import { message, Modal, Form, Button, Card, Input, Select, Pagination } from "antd";
import { DeleteOutlined, EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { BASE_URL } from "../../util/fetchfromAPI";
import "../../../public/admin/css/ManageCourse.css";
import moment from "moment";
const ManageCourses: React.FC = (ManageCoursesProps) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editCourse, setEditCourse] = useState<any>(null);
    const [form] = Form.useForm();
    const getToken = () => localStorage.getItem("token");
    const [categories, setCategories] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isStudentModalVisible, setIsStudentModalVisible] = useState<boolean>(false);
    const [registrationCount, setRegistrationCount] = useState<number>(0);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [totalCourses, setTotalCourses] = useState(0);


    useEffect(() => {
        fetchCourses();
        fetchCategories();
        fetchDiscounts();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}/khoa-hoc`, {
                params: {
                    page: currentPage - 1,
                    size: pageSize
                }
            });
            setCourses(data.content);
            setTotalCourses(data.totalElements);
        } catch (error) {
            console.error("Error fetching courses:", error);
            message.error("Có lỗi xảy ra khi tải danh sách khóa học.");
        }
    };

    const fetchCategories = async () => {
        try {
            const token = getToken();
            const { data } = await axios.get(`${BASE_URL}/danhmuc/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(data.content);
        } catch (error) {
            message.error("Có lỗi xảy ra khi tải danh sách danh mục.");
        }
    };

    const fetchDiscounts = async () => {
        try {
            const token = getToken();
            if (!token) {
                message.error("Token không hợp lệ.");
                return;
            }
            const { data } = await axios.get(`${BASE_URL}/khuyenmai/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(data.data);
        } catch (error) {
            message.error("Có lỗi xảy ra khi tải danh sách khuyến mãi.");
        }
    };

    const fetchCourseRegistrationStats = async (courseId: number) => {
        try {
            const token = getToken();
            const { data } = await axios.get(`${BASE_URL}/khoa-hoc-dang-ky/thong-ke/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.content.soLuotDangKy;
        } catch (error) {
            console.error("Error fetching registration stats:", error);
            return 0;
        }
    };

    const fetchStudentsForCourse = async (courseId: number) => {
        try {
            const token = getToken();
            if (!token) {
                message.error("Vui lòng đăng nhập để thực hiện thao tác này.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(`${BASE_URL}/khoa-hoc-dang-ky/hocvien/${courseId}`, config);
            setStudents(response.data.content.danhSachHocVien);


            const soLuotDangKy = await fetchCourseRegistrationStats(courseId);
            setRegistrationCount(soLuotDangKy);

            setIsStudentModalVisible(true);
        } catch (error) {
            console.error("Error fetching students for course:", error);
            message.error("Không có học viên nào đăng ký !!!.");
        }
    };

    const handleAddCourse = () => {
        setEditCourse(null);
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleEditCourse = (course: any) => {
        setEditCourse(course);
        setIsModalVisible(true);
        form.setFieldsValue(course);
    };

    const handleDeleteCourse = async (id: number) => {
        console.log("Deleting course with ID:", id);
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                message.error("Vui lòng đăng nhập để thực hiện thao tác này.");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.delete(`${BASE_URL}/khoa-hoc/delete/${id}`, config);
            console.log(response.data);
            message.success("Xóa khóa học thành công.");

            fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            message.error("Bạn không có quyền xóa khóa học này!!!!.");
        }
    };

    const handleModalOk = async () => {
        try {
            // Validate các trường của form
            const values = await form.validateFields();

            // Dữ liệu khóa học được lấy từ form
            const courseData = {
                TenKhoaHoc: values.TenKhoaHoc,
                MoTaKhoaHoc: values.MoTaKhoaHoc,
                HinhAnh: values.HinhAnh,
                LoaiKhoaHoc: values.LoaiKhoaHoc,
                IDDanhMuc: values.IDDanhMuc,
                GiaTien: values.GiaTien,
                IDKhuyenMai: values.IDKhuyenMai,
                LuotXem: values.LuotXem || 0,
                SoLuongHocVien: values.SoLuongHocVien || 0,
                GiamGia: values.GiamGia || 0,
                LinkVideo: values.LinkVideo,
            };

            console.log("Dữ liệu khóa học gửi đi:", courseData);

            // Kiểm tra token
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Vui lòng đăng nhập để thực hiện thao tác này.");
                return;
            }

            // Cấu hình header với token
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            let response;
            if (editCourse) {
                // Cập nhật khóa học
                response = await axios.put(
                    `${BASE_URL}/khoa-hoc/put/${editCourse.IDKhoaHoc}`,
                    courseData,
                    config
                );
                message.success("Cập nhật khóa học thành công.");
            } else {
                // Tạo khóa học mới
                const newCourseData = {
                    ...courseData,
                    TrangThai: "chua_duyet",
                    NgayGuiKiemDuyet: new Date().toISOString(),
                };
                response = await axios.post(`${BASE_URL}/khoa-hoc/add`, newCourseData, config);
                message.success("Thêm khóa học thành công, chờ duyệt.");
            }

            // Cập nhật danh sách khóa học
            fetchCourses();

            // Đóng modal sau khi hoàn thành
            setIsModalVisible(false);
        } catch (error) {
            if (error.response) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else {
                message.error("Có lỗi xảy ra khi lưu khóa học.");
            }
        }
    };






    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleStudentModalCancel = () => {
        setIsStudentModalVisible(false);
    };
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="manage-courses-container">
            <h1>Quản lý khóa học</h1>
            <Button type="primary" onClick={handleAddCourse}>
                Thêm khóa học
            </Button>
            <div style={{ marginTop: "20px" }}>
                {courses.map((course) => (
                    <div key={course.IDKhoaHoc} className="manage-courses-card">
                        <div className="manage-courses-info">
                            <div className="manage-courses-id">ID: {course.IDKhoaHoc}</div>
                            <div className="manage-courses-name">{course.TenKhoaHoc}</div>
                        </div>
                        <div className="manage-courses-actions">
                            <Button
                                className="manage-courses-edit-button"
                                icon={<EditOutlined />}
                                onClick={() => handleEditCourse(course)}
                            />
                            <Button
                                className="manage-courses-delete-button"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteCourse(course.IDKhoaHoc)}
                            />
                            <Button
                                className="manage-courses-view-students-button"
                                icon={<UsergroupAddOutlined />}
                                onClick={() => fetchStudentsForCourse(course.IDKhoaHoc)}
                            >
                                Xem danh sách học viên
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Pagination */}
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCourses}
                onChange={handlePageChange}
                style={{ marginTop: "20px", textAlign: "center" }}
            />
            {/* Modal Thêm/Sửa khóa học */}
            <Modal
                title={editCourse ? "Sửa khóa học" : "Thêm khóa học"}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editCourse ? "Cập nhật" : "Thêm"}
            >
                <Form
                    form={form}
                    initialValues={editCourse}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    layout="horizontal"
                >
                    <Form.Item
                        label="Tên khóa học"
                        name="TenKhoaHoc"
                        rules={[{ required: true, message: "Vui lòng nhập tên khóa học!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả khóa học"
                        name="MoTaKhoaHoc"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả khóa học!" }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="GiaTien"
                        rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giảm giá"
                        name="GiamGia"
                        rules={[{ required: false, message: "Vui lòng nhập mức giảm giá!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Loại khóa học"
                        name="LoaiKhoaHoc"
                        rules={[{ required: true, message: "Vui lòng chọn loại khóa học!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Video khóa học"
                        name="LinkVideo"
                        rules={[{ required: false, message: "Vui lòng nhập link video khóa học!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="IDDanhMuc"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                    >
                        <Select>
                            {categories.map((category) => (
                                <Option key={category.IDDanhMuc} value={category.IDDanhMuc}>
                                    {category.TenDanhMuc}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Khuyến mãi"
                        name="IDKhuyenMai"
                        rules={[{ required: true, message: "Vui lòng chọn khuyến mãi!" }]}
                    >
                        <Select>
                            {discounts.map((discount) => (
                                <Option key={discount.IDKhuyenMai} value={discount.IDKhuyenMai}>
                                    {discount.TenKhuyenMai}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh"
                        name="HinhAnh"
                        rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng học viên"
                        name="SoLuongHocVien"
                        rules={[{ required: true, message: "Vui lòng nhập số lượng học viên!" }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        label="Lượt xem"
                        name="LuotXem"
                        rules={[{ required: true, message: "Vui lòng nhập số lượt xem!" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Danh sách học viên */}
            <Modal
                title="Danh sách học viên đã đăng ký"
                visible={isStudentModalVisible}
                onCancel={handleStudentModalCancel}
                footer={null}
            >
                <div>
                    <h3>Tổng số lượt đăng ký: {registrationCount}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {students.length > 0 ? (
                            students.map((student: any) => (
                                <Card key={student.IDNguoiDung} style={{ width: "100%" }}>
                                    <div>
                                        <strong>{student.IDNguoiDung_NguoiDung.HoTen}</strong>{" "}
                                        ({student.IDNguoiDung_NguoiDung.Email})
                                    </div>
                                    <div>Ngày đăng ký: {moment(student.ngayDangKy).format("DD/MM/YYYY")}</div>
                                </Card>
                            ))
                        ) : (
                            <p>Không có học viên nào đăng ký khóa học này.</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );

};

export default ManageCourses;