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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const tenants = [];

    for (let i = 0; i < numTenants; i++) {
      tenants.push({
        phone: formData.get(`tenants[${i}].phone`),
        id_card: formData.get(`tenants[${i}].id_card`),
        email: formData.get(`tenants[${i}].email`),
        full_name: formData.get(`tenants[${i}].full_name`),
      });
    }

    const contract = new FormData();

    contract.append("tenants", JSON.stringify(tenants));
    contract.append("payment_cycle", formData.get("payment_cycle"));
    contract.append("price_per_cycle", formData.get("price_per_cycle"));
    contract.append("electricity_type", formData.get("electricity_type"));
    contract.append("water_type", formData.get("water_type"));
    contract.append("electricity_price", formData.get("electricity_price"));
    contract.append("water_price", formData.get("water_price"));
    contract.append("electricity_start", formData.get("electricity_start"));
    contract.append("water_start", formData.get("water_start"));
    contract.append("num_people", formData.get("num_people"));
    contract.append("note", formData.get("note"));
    contract.append("start_date", formData.get("start_date"));
    contract.append("end_date", formData.get("end_date"));
    contract.append("room_id", rooms.id.toString());

    const elecFile = formData.get("electricityImage");
    const waterFile = formData.get("waterImage");
    if (elecFile) contract.append("electricityImages", elecFile);
    if (waterFile) contract.append("waterImages", waterFile);

    console.log("📦 Contract payload:", contract);

    await callApi(`${URL_ENDPOINTS.CONTRACT_LIST_URL}`, {
      method: "POST",
      data: contract,
      withCredentials: true,
    });
  };

  return (
    <form
      className="space-y-4 bg-white p-10 rounded shadow-md text-black"
      onSubmit={handleSubmit}
    >
      <div className={`grid grid-cols-1 ${numTenants === 1 ? "" : "md:grid-cols-2"} gap-4`}>
        {[...Array(numTenants)].map((_, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <h3 className="font-semibold text-gray-700">
              {numTenants === 1 ? "Thông tin người thuê" : `Người thuê ${index + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div>
                  <label className="block mb-1">Số điện thoại</label>
                  <input
                    name={`tenants[${index}].phone`}
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">CCCD/Hộ chiếu</label>
                  <input
                    name={`tenants[${index}].id_card`}
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
                    name={`tenants[${index}].email`}
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Họ và tên</label>
                  <input
                    name={`tenants[${index}].full_name`}
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

      {/* Thông tin hợp đồng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2 font-semibold text-lg text-gray-800">
          Thông tin hợp đồng
        </div>

        <div>
          <label className="block mb-1">Chu kì thanh toán</label>
          <select name="payment_cycle" className="w-full border rounded-lg px-3 py-2" required>
            <option value="1">1 tháng</option>
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">1 năm</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Giá/Chu kỳ</label>
          <input name="price_per_cycle" type="text" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Cách tính giá điện</label>
          <select name="electricity_type" className="w-full border rounded-lg px-3 py-2" required>
            <option value="1">Theo người</option>
            <option value="2">Theo phòng</option>
            <option value="3">Theo số điện</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Cách tính giá nước</label>
          <select name="water_type" className="w-full border rounded-lg px-3 py-2" required>
            <option value="1">Theo người</option>
            <option value="2">Theo phòng</option>
            <option value="3">Theo số nước</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Giá điện</label>
          <input name="electricity_price" type="text" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Giá nước</label>
          <input name="water_price" type="text" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Số đồng hồ điện ban đầu</label>
          <input name="electricity_start" type="number" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Số đồng hồ nước ban đầu</label>
          <input name="water_start" type="number" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Ảnh số điện hiện tại</label>
          <input className="w-full border px-3 py-2 rounded" type="file" accept="image/*" name="electricityImage" />
        </div>

        <div>
          <label className="block mb-1">Ảnh số nước hiện tại</label>
          <input className="w-full border px-3 py-2 rounded" type="file" accept="image/*" name="waterImage" />
        </div>

        <div>
          <label className="block mb-1">Số người ở</label>
          <input name="num_people" type="number" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Ghi chú</label>
          <input name="note" type="text" className="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label className="block mb-1">Ngày bắt đầu HD</label>
          <input name="start_date" type="date" className="w-full border px-3 py-2 rounded" required />
        </div>

        <div>
          <label className="block mb-1">Ngày kết thúc HD</label>
          <input name="end_date" type="date" className="w-full border px-3 py-2 rounded" required />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
