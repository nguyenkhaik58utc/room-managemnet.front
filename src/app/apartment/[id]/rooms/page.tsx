/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { callApi } from "../../../services/api";
import { URL_ENDPOINTS } from "../../../services/endpoints";
import { useParams } from "next/navigation";

type RoomApartment = {
  id: number;
  apartment_id: number;
  room_num_bar: string;
  default_price: number;
  max_tenant: number;
  thumbnail?: string | File | null;
  gallery?: (string | File)[] | null;
};

export default function RoomApartmentPage() {
  const [rooms, setRooms] = useState<RoomApartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomApartment | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    apartment_id: 0,
    room_num_bar: "",
    default_price: 0,
    max_tenant: 0,
    thumbnail: null,
    gallery: [],
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await callApi(`${URL_ENDPOINTS.ROOM_LIST_URL}/${id}`, {
        method: "GET",
        withCredentials: true,
      });
      setRooms(res || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try {
      await callApi(`${URL_ENDPOINTS.ROOM_LIST_URL}/${id}`, {
        method: "DELETE",
        withCredentials: true,
      });
      setRooms(rooms.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Error deleting house:", error);
    }
  };
  const handleOpenModal = async (room?: RoomApartment) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        id: room.id,
        apartment_id: room.apartment_id,
        room_num_bar: room.room_num_bar,
        default_price: room.default_price,
        max_tenant: room.max_tenant,
        thumbnail: room.thumbnail || "",
        gallery: room.gallery || [],
      });
    } else {
      setEditingRoom(null);
      setFormData({
        id: 0,
        apartment_id: id ? parseInt(id.toString(), 10) : 0,
        room_num_bar: "",
        default_price: 0,
        max_tenant: 1,
        thumbnail: "",
        gallery: [],
      });
    }
    setShowModal(true);
  };
  const formatNumber = (num: number) => {
    if (!num) return "";
    return num.toLocaleString("en-US");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      dataToSend.append("apartment_id", `${formData.apartment_id}`);
      dataToSend.append("room_num_bar", formData.room_num_bar);
      dataToSend.append("default_price", `${formData.default_price ?? 0}`);
      dataToSend.append("max_tenant", `${formData.max_tenant}`);

      if (formData.thumbnail && formData.thumbnail instanceof File) {
        dataToSend.append("thumbnails", formData.thumbnail);
      }
      if (formData.gallery && formData.gallery.length > 0) {
        formData.gallery.forEach((file) => {
          if (file instanceof File) dataToSend.append("galleries", file);
        });
      }
      if (editingRoom) {
        const updated = await callApi(
          `${URL_ENDPOINTS.ROOM_LIST_URL}/${editingRoom.id}`,
          { method: "PUT", data: dataToSend, withCredentials: true }
        );
        setRooms(rooms.map((h) => (h.id === editingRoom.id ? updated : h)));
      } else {
        const created = await callApi(`${URL_ENDPOINTS.ROOM_LIST_URL}`, {
          method: "POST",
          data: dataToSend,
          withCredentials: true,
        });
        setRooms([...rooms, created]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving house:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Quản lý phòng trọ</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Thêm phòng trọ
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500">Chưa có phòng nào.</p>
        ) : (
          <div className="rounded-xl border border-black overflow-hidden">
            <table className="w-full text-left text-black">
              <thead className="bg-gray-100">
                <tr className="text-center">
                  <th className="p-2 border-r border-b">Tên</th>
                  <th className="p-2 border-r border-b">Giá phòng</th>
                  <th className="p-2 border-r border-b">Số người ở tối đa</th>
                  <th className="p-2 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="last:[&>td]:border-b-0">
                    <td className="p-2 border-r border-b">
                      {room.room_num_bar}
                    </td>
                    <td className="p-2 border-r border-b">
                      {room.default_price.toLocaleString()} VND
                    </td>
                    <td className="p-2 border-r border-b text-center">
                      {room.max_tenant ?? 0}
                    </td>
                    <td className="p-2 border-b text-center space-x-2">
                      <button
                        onClick={() => window.location.href = `/apartment/${id}/rooms/${room.id}/contract`}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Contract
                      </button>
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-black">
            <h2 className="text-xl font-bold mb-4">
              {editingRoom ? "Sửa thông tin phòng" : "Thêm thông tin phòng"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="max-h-90 overflow-y-auto">
                <div>
                  <label className="block mb-1">Tên phòng</label>
                  <input
                    type="text"
                    value={formData.room_num_bar}
                    onChange={(e) =>
                      setFormData({ ...formData, room_num_bar: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Giá phòng</label>
                  <input
                    type="text"
                    value={formatNumber(formData.default_price)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      const numericValue = Number(rawValue);
                      if (!isNaN(numericValue)) {
                        if (numericValue < 1000000000)
                          setFormData({
                            ...formData,
                            default_price: numericValue,
                          });
                      } else if (rawValue === "") {
                        setFormData({ ...formData, default_price: 0 });
                      }
                    }}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Số người ở tối đa</label>
                  <input
                    type="number"
                    value={formData.max_tenant}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0 && value < 5) {
                        setFormData({ ...formData, max_tenant: value });
                      }
                    }}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div className="mt-2">
                  <label className="block mb-1">Thumbnail (1 ảnh)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnail: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={
                          typeof formData.thumbnail === "string"
                            ? process.env.NEXT_PUBLIC_AWS_DOMAIN_URL +
                              formData.thumbnail
                            : URL.createObjectURL(formData.thumbnail)
                        }
                        alt="Thumbnail preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <label className="block mb-1">Gallery (tối đa 5 ảnh)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 5) {
                        alert("Chỉ được chọn tối đa 5 ảnh");
                        return;
                      }
                      setFormData({ ...formData, gallery: files });
                    }}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {formData.gallery && formData.gallery.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {formData.gallery.map((file, idx) => (
                        <img
                          key={idx}
                          src={
                            typeof file === "string"
                              ? process.env.NEXT_PUBLIC_AWS_DOMAIN_URL + file
                              : URL.createObjectURL(file)
                          }
                          alt={`Gallery ${idx}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingRoom ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
