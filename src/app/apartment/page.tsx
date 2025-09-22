"use client";

import { useEffect, useState } from "react";
import { callApi } from "../services/api";
import { URL_ENDPOINTS } from "../services/endpoints";

type BoardingHouse = {
  id: number;
  name: string;
  address: string;
  price: number;
};

export default function BoardingHousePage() {
  const [houses, setHouses] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await callApi(`${URL_ENDPOINTS.APARTMENT_LIST_URL}`, { method: "GET" });
      setHouses(res || []);
    } catch (error) {
      console.error("Error loading houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhà trọ này?")) return;
    try {
      await callApi(`/boarding-houses/${id}`, { method: "DELETE" });
      setHouses(houses.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Error deleting house:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Quản lý nhà trọ</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            + Thêm nhà trọ
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : houses.length === 0 ? (
          <p className="text-gray-500">Chưa có nhà trọ nào.</p>
        ) : (
          <table className="w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Tên</th>
                <th className="p-2 border">Địa chỉ</th>
                <th className="p-2 border">Giá</th>
                <th className="p-2 border text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house) => (
                <tr key={house.id}>
                  <td className="p-2 border">{house.name}</td>
                  <td className="p-2 border">{house.address}</td>
                  <td className="p-2 border">{house.price}đ</td>
                  {/* <td className="p-2 border">{house.price.toLocaleString()}đ</td> */}
                  <td className="p-2 border text-center space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
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
    </div>
  );
}
