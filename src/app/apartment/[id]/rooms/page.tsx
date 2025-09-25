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
      });
    } else {
      setEditingRoom(null);
      setFormData({
        id: 0,
        apartment_id: id ? parseInt(id.toString(), 10) : 0,
        room_num_bar: "",
        default_price: 0,
        max_tenant: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        const updated = await callApi(
          `${URL_ENDPOINTS.ROOM_LIST_URL}/${editingRoom.id}`,
          { method: "PUT", data: formData, withCredentials: true }
        );
        setRooms(rooms.map((h) => (h.id === editingRoom.id ? updated : h)));
      } else {
        const dataToSend = {
          apartment_id: formData.apartment_id,
          room_num_bar: formData.room_num_bar,
          default_price: formData.default_price,
          max_tenant: formData.max_tenant,
        };
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
          <table className="w-full border border-gray-200 text-left text-black">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="p-2 border">Tên</th>
                <th className="p-2 border">Giá phòng</th>
                <th className="p-2 border">Số người ở tối đa</th>
                <th className="p-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="p-2 border">{room.room_num_bar}</td>
                  <td className="p-2 border">
                    {room.default_price.toLocaleString()} VND
                  </td>
                  <td className="p-2 border text-center">
                    {room.max_tenant ?? 0}
                  </td>
                  <td className="p-2 border text-center space-x-2">
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4 text-black">
              {editingRoom ? "Sửa thông tin phòng" : "Thêm thông tin phòng"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-black">Tên phòng</label>
                <input
                  type="text"
                  value={formData.room_num_bar}
                  onChange={(e) =>
                    setFormData({ ...formData, room_num_bar: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded text-black"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-black">Giá phòng</label>
                <input
                  type="number"
                  value={formData.default_price}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0 && value < 100000000) {
                      setFormData({ ...formData, default_price: value });
                    }
                  }}
                  className="w-full border px-3 py-2 rounded text-black"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-black">
                  Số người ở tối đa
                </label>
                <input
                  type="number"
                  value={formData.max_tenant}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0 && value < 5) {
                      setFormData({ ...formData, max_tenant: value });
                    }
                  }}
                  className="w-full border px-3 py-2 rounded text-black"
                  required
                />
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
