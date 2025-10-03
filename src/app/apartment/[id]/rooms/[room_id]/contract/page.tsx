"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { callApi } from "../../../../../services/api";
import { URL_ENDPOINTS } from "../../../../../services/endpoints";

type RoomApartment = {
  id: number;
  apartment_id: number;
  room_num_bar: string;
  default_price: number;
  max_tenant: number;
};

export default function Contract() {
  const { room_id } = useParams();
  const [numTenants, setNumTenants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomApartment>({} as RoomApartment);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await callApi(`${URL_ENDPOINTS.ROOM_LIST_URL}/room/${room_id}`, {
        method: "GET",
        withCredentials: true,
      });
      setRooms(res);
      if (res && res.max_tenant) setNumTenants(res.max_tenant);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 bg-white p-10 rounded shadow-md text-black">
      <div
        className={`grid grid-cols-1 ${
          numTenants == 1
            ? ""
            : "md:grid-cols-2"
        } gap-4`}
      >
        {[...Array(numTenants)].map((_, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg space-y-3 bg-gray-50"
          >
            <h3 className="font-semibold text-gray-700">
              {numTenants == 1
                ? "Thông tin người thuê"
                : `Người thuê ${index + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div>
                  <label className="block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">CCCD/Hộ chiếu</label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2 font-semibold text-lg text-gray-800">
          Thông tin hợp đồng
        </div>
        <div>
          <label className="block mb-1">Chu kì thanh toán</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="1">1 tháng</option>
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">1 năm</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Giá/Chu kỳ</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Cách tính giá điện</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="1">Theo người</option>
            <option value="2">Theo phòng</option>
            <option value="3">Theo số điện</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Cách tính giá nước</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="1">Theo người</option>
            <option value="2">Theo phòng</option>
            <option value="3">Theo số nước</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Giá điện</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Giá nước</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Số đồng hồ điện ban đầu</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Số đồng hồ nước ban đầu</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Số người ở</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Ghi chú</label>
          <input
            type="area"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Ngày bắt đầu HD</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Ngày kết thúc HD</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tạo hợp đồng
        </button>
        <button
          type="button"
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={() => window.history.back()}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
