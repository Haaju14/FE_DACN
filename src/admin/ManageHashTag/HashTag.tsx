import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Spin, Popconfirm } from "antd";
import axios from "axios";
import { BASE_URL } from "../../util/fetchfromAPI";

interface KhoaHoc {
  IDKhoaHoc: number;
  TenKhoaHoc: string;
}

interface Hashtag {
  IDHashTag: number;
  HashTagName: string;
}

const HashtagManagement = () => {
  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<KhoaHoc | null>(null);
  const [newHashtag, setNewHashtag] = useState<string>("");
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);

  const getToken = () => localStorage.getItem("token");

  // Fetch danh sách khóa học
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/khoa-hoc`);
      setCourses(response.data.content || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách hashtag
  const fetchHashtags = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/hashtag/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHashtags(response.data.data || []);
    } catch (error) {
      console.error("Error fetching hashtags:", error);
      message.error("Không thể tải danh sách hashtag.");
    }
  };

  // Thêm hashtag vào khóa học
  const handleAddHashtag = async () => {
    if (!selectedCourse || !newHashtag) {
      message.error("Vui lòng chọn khóa học và nhập hashtag.");
      return;
    }

    try {
      const token = getToken();
      await axios.post(
        `${BASE_URL}/hashtags/course/${selectedCourse.IDKhoaHoc}`,
        { HashTagName: newHashtag },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Thêm hashtag thành công!");
      setModalVisible(false);
      setNewHashtag("");
      fetchCourses();
      fetchHashtags();
    } catch (error) {
      console.error("Error adding hashtag:", error);
      message.error("Không thể thêm hashtag vào khóa học.");
    }
  };

  // Xóa hashtag
  const handleDeleteHashtag = async (IDHashTag: number) => {
    try {
      const token = getToken();
      await axios.delete(`${BASE_URL}/hashtag/delete/${IDHashTag}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Xóa hashtag thành công!");
      fetchHashtags();
    } catch (error) {
      console.error("Error deleting hashtag:", error);
      message.error("Không thể xóa hashtag.");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchHashtags();
  }, []);

  // Cột hiển thị cho bảng danh sách khóa học
  const columns = [
    {
      title: "ID Khóa Học",
      dataIndex: "IDKhoaHoc",
      key: "IDKhoaHoc",
    },
    {
      title: "Tên Khóa Học",
      dataIndex: "TenKhoaHoc",
      key: "TenKhoaHoc",
    },
    {
      title: "Thao Tác",
      key: "actions",
      render: (record: KhoaHoc) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedCourse(record);
            setModalVisible(true);
          }}
        >
          Thêm Hashtag
        </Button>
      ),
    },
  ];

  // Cột hiển thị cho bảng danh sách hashtag
  const hashtagColumns = [
    {
      title: "ID Hashtag",
      dataIndex: "IDHashTag",
      key: "IDHashTag",
    },
    {
        title: "ID Khóa Học",
        dataIndex: "IDKhoaHoc",
        key: "IDKhoaHoc",
    },
    {
      title: "Tên Hashtag",
      dataIndex: "HashTagName",
      key: "HashTagName",
    },
    {
      title: "Thao Tác",
      key: "actions",
      render: (record: Hashtag) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa hashtag này không?"
          onConfirm={() => handleDeleteHashtag(record.IDHashTag)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="primary" danger>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="hashtag-management">
      <h1>Quản Lý Hashtag</h1>
      {loading ? (
        <Spin tip="Đang tải danh sách khóa học..." />
      ) : (
        <Table
          dataSource={courses}
          columns={columns}
          rowKey={(record) => record.IDKhoaHoc}
        />
      )}

      {/* Modal thêm hashtag */}
      <Modal
        title="Thêm Hashtag"
        visible={modalVisible}
        onOk={handleAddHashtag}
        onCancel={() => {
          setModalVisible(false);
          setNewHashtag("");
        }}
        okText="Thêm"
        cancelText="Hủy"
      >
        <p>Khóa học: {selectedCourse?.TenKhoaHoc}</p>
        <Input
          placeholder="Nhập hashtag"
          value={newHashtag}
          onChange={(e) => setNewHashtag(e.target.value)}
        />
      </Modal>

      {/* Hiển thị danh sách hashtag */}
      <h2>Danh Sách Hashtag</h2>
      <Table
        dataSource={hashtags}
        columns={hashtagColumns}
        rowKey={(record) => record.IDHashTag}
      />
    </div>
  );
};

export default HashtagManagement;
