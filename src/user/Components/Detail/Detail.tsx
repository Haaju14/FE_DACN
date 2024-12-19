import axios from "axios";
import { message } from "antd";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { BASE_URL } from "../../../util/fetchfromAPI";
import Loading from "../Antd/Loading";
import React, { useState, useEffect } from "react";
import "../../../../public/user/css/Detail.css";

interface KhoaHocData {
  IDKhoaHoc: number;
  IDDanhMuc: number;
  TenKhoaHoc: string;
  MoTaKhoaHoc: string;
  HinhAnh: string;
  NgayDang: string;
  LuotXem: number;
  SoLuongHocVien: number;
  GiamGia: number;
  LoaiKhoaHoc: string;
  GiaTien: string;
  LinkVideo: string;
  IDNguoiDung_NguoiDung?: NguoiDung;
  IDDanhMuc_DanhMucKhoaHoc?: DanhMucKhoaHoc;
  IDKhuyenMai_KhuyenMai?: KhuyenMai;
  Hashtags?: Hashtag[];
}

interface User {
  IDNguoiDung: number;
  AnhDaiDien: string;
  HoTen: string;
}

interface Reply {
  IDReplyBinhLuan: number;
  NoiDung: string;
  IDNguoiDung_NguoiDung: User;
}

interface BinhLuanData {
  IDKhoaHoc: number;
  IDBinhLuan: number;
  NoiDung: string;
  IDNguoiDung_NguoiDung: User;
  replies?: Reply[];
  showReply?: boolean;
}
interface NguoiDung {
  IDNguoiDung: number;
  HoTen: string;
}

interface DanhMucKhoaHoc {
  IDDanhMuc: number;
  TenDanhMuc: string;
}

interface KhuyenMai {
  IDKhuyenMai: number;
  TenKhuyenMai: string;
}

interface Hashtag {
  IDHashTag: number;
  HashTagName: string;
}

const Detail: React.FC = () => {
  const { id: IDKhoaHoc } = useParams();
  const userLogin = useSelector(
    (state: RootState) => state.userReducer.userLogin
  );
  const token = localStorage.getItem("token");
  const [rating, setRating] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [feedbackContent, setFeedbackContent] = useState<string>("");
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>(
    {}
  );

  const [comments, setComments] = useState<BinhLuanData[]>([]);
  if (!token) {
    return <div>Please log in to view course details.</div>;
  }

  if (!userLogin || !userLogin.user) {
    return <div>Please log in to comment on the course.</div>;
  }

  const getCourseDetailAPI = async (IDKhoaHoc: string, token: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/khoa-hoc/xem-chi-tiet/${IDKhoaHoc}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.content;
    } catch (error: any) {
      console.error("Error:", error);
      throw new Error(
        error.response ? error.response.data.message : error.message
      );
    }
  };

  const getCommentsAPI = async (IDKhoaHoc: string, token: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/binh-luan/get/${IDKhoaHoc}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data.content || []);
    } catch (error: any) {
      console.error("Error:", error);
      throw new Error(
        error.response ? error.response.data.message : error.message
      );
    }
  };



  const queryResultKhoaHocByID: UseQueryResult<KhoaHocData | undefined> =
    useQuery({
      queryKey: ["courseByIDApi", IDKhoaHoc || ""],
      queryFn: () => getCourseDetailAPI(IDKhoaHoc || "", token),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    });

  useEffect(() => {
    if (IDKhoaHoc && token) {
      getCommentsAPI(IDKhoaHoc, token);
    }
  }, [IDKhoaHoc, token]);



  if (queryResultKhoaHocByID.isLoading) {
    return <Loading />;
  }

  if (queryResultKhoaHocByID.isError) {
    return <div>Error: {(queryResultKhoaHocByID.error as Error).message}</div>;
  }

  const KhoaHocData = queryResultKhoaHocByID.data;

  if (!KhoaHocData) {
    return <div>No course details available.</div>;
  }

  const handleRegisterCourse = async () => {
    try {
      await axios.post(
        `${BASE_URL}/khoa-hoc-dang-ky/${IDKhoaHoc}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đăng ký khóa học thành công!");
    } catch (error: any) {
      console.error("Error details:", error.response);
      message.error("Đã xảy ra lỗi trong quá trình đăng ký khóa học.");
    }
  };

  const handleSubmitComment = async () => {
    if (!comment) {
      message.error("Vui lòng nhập bình luận.");
      return;
    }

    try {
      const commentData: BinhLuanData = {
        IDBinhLuan: 0,
        IDKhoaHoc: Number(IDKhoaHoc), 
        NoiDung: comment,
        IDNguoiDung_NguoiDung: {
          IDNguoiDung: userLogin.user.IDNguoiDung.toString(), 
          HoTen: userLogin.user.HoTen || "",
        },
        ThoiGian: new Date().toISOString(),
        TenNguoiDung: userLogin.user.HoTen || "",
      };
      

      await axios.post(`${BASE_URL}/binh-luan/post/${IDKhoaHoc}`, commentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Bình luận thành công!");
      setComment("");
      getCommentsAPI(IDKhoaHoc, token);
    } catch (error: any) {
      console.error("Error submitting comment:", error.response || error);
      message.error("Đã xảy ra lỗi trong quá trình gửi bình luận.");
    }
  };

  const handleReplyChange = (commentId: number, content: string) => {
    setReplyContent((prev) => ({ ...prev, [commentId]: content }));
  };

  const handleSubmitReply = async (parentCommentId: number) => {
    const replyText = replyContent[parentCommentId];
    if (!replyText) {
      message.error("Vui lòng nhập nội dung trả lời.");
      return;
    }

    const replyData: BinhLuanData = {
      IDBinhLuan: 0,
      IDKhoaHoc: Number(IDKhoaHoc),
      NoiDung: replyText,
      IDNguoiDung: userLogin.user.IDNguoiDung.toString(),
      ThoiGian: new Date().toISOString(),
      TenNguoiDung: userLogin.user.HoTen || "",
    };

    try {
      await axios.post(
        `${BASE_URL}/binh-luan/reply/${parentCommentId}`,
        replyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Trả lời thành công!");
      setReplyContent((prev) => ({ ...prev, [parentCommentId]: "" }));
      getCommentsAPI(IDKhoaHoc, token);
    } catch (error: any) {
      console.error("Error submitting reply:", error.response || error);
      message.error("Đã xảy ra lỗi trong quá trình gửi trả lời.");
    }
  };

  const toggleReply = (commentId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.IDBinhLuan === commentId
          ? { ...comment, showReply: !comment.showReply }
          : comment
      )
    );
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !feedbackContent) {
      message.error("Vui lòng chọn đánh giá và nhập nội dung nhận xét.");
      return;
    }

    // Dữ liệu cần gửi đến API
    const feedbackData = {
      noiDung: feedbackContent, // Nội dung nhận xét
      xepLoai: rating,          // Đánh giá sao
    };

    try {
      // Gửi yêu cầu POST đến backend để thêm nhận xét
      await axios.post(`${BASE_URL}/nhan-xet/add/${IDKhoaHoc}`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });

      message.success("Đánh giá thành công!");
      setFeedbackContent(""); // Reset nội dung nhận xét
      setRating(null); // Reset đánh giá sao
    } catch (error: any) {
      console.error("Error submitting feedback:", error.response || error);
      message.error("Đã xảy ra lỗi trong quá trình gửi đánh giá.");
    }
  };


  return (
    <section className="ftco-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="course-detail">
              <h2 className="mb-4">
                {KhoaHocData.TenKhoaHoc || "Tên khóa học không có"}
              </h2>

              {/* Video giới thiệu khóa học */}
              <div className="single-slider owl-carousel mb-4">
                <div
                  className="iframe-wrapper"
                  dangerouslySetInnerHTML={{ __html: KhoaHocData.LinkVideo }}
                ></div>
              </div>

              {/* Thông tin chi tiết khóa học */}
              <div className="course-info mt-4">
                <ul className="list-unstyled">
                  {/* Mô tả khóa học */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Mô tả khóa học</span>
                    <span>{KhoaHocData.MoTaKhoaHoc || "Chưa có mô tả"}</span>
                  </li>

                  {/* Số học viên */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Số lượng học viên</span>
                    <span>{KhoaHocData.SoLuongHocVien || "0"}</span>
                  </li>

                  {/* Giá khóa học và Giảm giá */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Giá khóa học</span>
                    <span>
                      {parseFloat(KhoaHocData.GiamGia) > 0 ? (
                        <>
                          <span style={{ textDecoration: "line-through", color: "red" }}>
                            {parseFloat(KhoaHocData.GiaTien).toFixed(0)} VND
                          </span>
                          {" "}
                          <strong style={{ color: "green" }}>
                            {(
                              parseFloat(KhoaHocData.GiaTien) -
                              (parseFloat(KhoaHocData.GiaTien) * parseFloat(KhoaHocData.GiamGia) / 100)
                            ).toFixed(0)} VND
                          </strong>
                        </>
                      ) : (
                        <strong style={{ color: "green" }}>
                          {parseFloat(KhoaHocData.GiaTien).toFixed(0)} VND
                        </strong>
                      )}
                    </span>
                  </li>

                  {/* Danh mục khóa học */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Danh mục</span>
                    <span>{KhoaHocData.IDDanhMuc_DanhMucKhoaHoc?.TenDanhMuc || "Chưa có danh mục"}</span>
                  </li>

                  {/* Khuyến mãi */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Khuyến mãi</span>
                    <span>{KhoaHocData.IDKhuyenMai_KhuyenMai?.TenKhuyenMai || "Chưa có khuyến mãi"}</span>
                  </li>

                  {/* Giảng viên */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Giảng viên</span>
                    <span>{KhoaHocData.IDNguoiDung_NguoiDung?.HoTen || "Chưa có giảng viên"}</span>
                  </li>

                  {/* Hashtags */}
                  <li className="d-flex justify-content-between align-items-center py-2">
                    <span>Hashtags</span>
                    <span>{KhoaHocData.Hashtags?.map((hashtag) => hashtag.HashTagName).join(", ") || "Không có hashtags"}</span>
                  </li>
                </ul>

                {/* Nút đăng ký khóa học */}
                <button
                  onClick={handleRegisterCourse}
                  className="btn btn-primary btn-lg mt-3"
                >
                  Đăng ký khóa học
                </button>
              </div>
            </div>


            {/* Bình luận và Đánh giá */}
            <div className="comments-section mt-5">
              <h4 className="mb-4">Bình luận</h4>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-control mb-3"
                rows={3}
                placeholder="Nhập bình luận..."
              />
              <button onClick={handleSubmitComment} className="btn blue">
                Gửi bình luận
              </button>

              <div className="replies mt-5">
                {comments.length ? (
                  comments.map((comment) => (
                    <div key={comment.IDBinhLuan}>
                      <p>
                        <strong>{comment.IDNguoiDung_NguoiDung?.HoTen}:</strong> {comment.NoiDung}
                      </p>

                      {/* Nút Trả lời sẽ chỉ hiển thị khi có bình luận */}
                      <button
                        onClick={() => toggleReply(comment.IDBinhLuan)}
                        className="btn btn-link reply-btn"
                      >
                        Trả lời
                      </button>

                      {/* Hiển thị phần trả lời chỉ khi nút "Trả lời" được bấm */}
                      {comment.showReply && (
                        <div className="reply-form">
                          <textarea
                            value={replyContent[comment.IDBinhLuan] || ""}
                            onChange={(e) => handleReplyChange(comment.IDBinhLuan, e.target.value)}
                            className="form-control mb-3"
                            rows={3}
                            placeholder="Nhập trả lời..."
                          />
                          <button
                            onClick={() => handleSubmitReply(comment.IDBinhLuan)}
                            className="btn btn-secondary"
                          >
                            <i className="fas fa-paper-plane"></i> Gửi trả lời
                          </button>
                        </div>
                      )}

                      {/* Hiển thị các trả lời đã có */}
                      <div className="replies-list mt-3">
                        {comment.replies && comment.replies.length > 0 ? (
                          comment.replies.map((reply) => (
                            <p key={reply.IDReplyBinhLuan} className="ml-4">
                              <strong>{reply.IDNguoiDung_NguoiDung?.HoTen}:</strong> {reply.NoiDung}
                            </p>
                          ))
                        ) : (
                          <p className="ml-4"></p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Chưa có bình luận nào.</p>
                )}
              </div>
            </div>

          </div>

          <div className="col-lg-4">
            {/* Đánh giá */}
            <div className="feedback-section">
              <h4 className="mb-4">Đánh giá khóa học</h4>
              <div className="form-group">
                <label>Chọn xếp loại:</label>
                <select
                  className="form-control"
                  value={rating || ""}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Chọn xếp loại</option>
                  <option value="tích cực">Tích cực</option>
                  <option value="tiêu cực">Tiêu cực</option>
                </select>
              </div>
              <textarea
                className="form-control mb-3"
                placeholder="Nhập nhận xét"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
              />
              <button
                onClick={handleSubmitFeedback}
                className="btn btn-primary"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Detail;
