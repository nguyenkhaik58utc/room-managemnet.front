/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { callApi } from "../services/api";
import { URL_ENDPOINTS } from "../services/endpoints";
import Link from "next/link";

type BoardingHouse = {
  ward: any;
  district: any;
  province: any;
  id: number;
  name: string;
  address: string;
  province_id: string;
  district_id: string;
  ward_id: string;
  totalRooms: number;
  emptyRooms: number;
  thumbnail?: string | File | null;
  gallery?: (string | File)[] | null;
};

type Option = {
  province_id: string;
  name: string;
  district_id: string;
  ward_id: string;
};

export default function BoardingHousePage() {
  const [houses, setHouses] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState<BoardingHouse | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    province_id: "",
    district_id: "",
    ward_id: "",
    thumbnail: null,
    gallery: [],
  });

  // Dropdown state
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);

  // Load danh sách apartments
  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await callApi(`${URL_ENDPOINTS.APARTMENT_LIST_URL}`, {
        method: "GET",
        withCredentials: true,
      });
      setHouses(res || []);
    } catch (error) {
      console.error("Error loading houses:", error);
    } finally {
      setLoading(false);
      fetchProvinces();
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await callApi(`${URL_ENDPOINTS.ADDRESS_PROVINCES}`, {
        method: "GET",
        withCredentials: true,
      });
      setProvinces(res);
    } catch (err) {
      console.error("Error loading provinces:", err);
    }
  };
  useEffect(() => {
    if (provinces && provinces.length > 0) {
      handleProvinceChange(provinces[0].province_id);
    }
  }, [provinces]);

  const handleProvinceChange = async (provinceId: string) => {
    setFormData({
      ...formData,
      province_id: provinceId,
      district_id: "",
      ward_id: "",
    });
    try {
      const res = await callApi(
        `${URL_ENDPOINTS.ADDRESS_DISTRICTS}/${provinceId}`,
        { method: "GET", withCredentials: true }
      );
      setDistricts(res);
      setWards([]);
    } catch (err) {
      console.error("Error loading districts:", err);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setFormData({
      ...formData,
      district_id: districtId,
      ward_id: "",
    });
    try {
      const res = await callApi(
        `${URL_ENDPOINTS.ADDRESS_WARDS}/${districtId}`,
        { method: "GET", withCredentials: true }
      );
      setWards(res);
    } catch (err) {
      console.error("Error loading wards:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhà trọ này?")) return;
    try {
      await callApi(`${URL_ENDPOINTS.APARTMENT_LIST_URL}/${id}`, {
        method: "DELETE",
        withCredentials: true,
      });
      setHouses(houses.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Error deleting house:", error);
    }
  };
  const handleOpenModal = async (house?: BoardingHouse) => {
    if (house) {
      setEditingHouse(house);
      setFormData({
        name: house.name,
        address: house.address,
        province_id: house.province_id,
        district_id: house.district_id,
        ward_id: house.ward_id,
        thumbnail: house.thumbnail || "",
        gallery: house.gallery || [],
      });

      if (house.province_id) {
        const resDistricts = await callApi(
          `${URL_ENDPOINTS.ADDRESS_DISTRICTS}/${house.province_id}`,
          { method: "GET", withCredentials: true }
        );
        setDistricts(resDistricts);
      }

      if (house.district_id) {
        const resWards = await callApi(
          `${URL_ENDPOINTS.ADDRESS_WARDS}/${house.district_id}`,
          { method: "GET", withCredentials: true }
        );
        setWards(resWards);
      }
    } else {
      setEditingHouse(null);
      setFormData({
        name: "",
        address: "",
        province_id: "",
        district_id: "",
        ward_id: "",
        thumbnail: "",
        gallery: [],
      });
      setDistricts([]);
      setWards([]);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("address", formData.address);
      dataToSend.append("province_id", formData.province_id);
      dataToSend.append("district_id", formData.district_id);
      dataToSend.append("ward_id", formData.ward_id);

      if (formData.thumbnail && formData.thumbnail instanceof File) {
        dataToSend.append("thumbnails", formData.thumbnail);
      }
      if (formData.gallery && formData.gallery.length > 0) {
        formData.gallery.forEach((file) => {
          if (file instanceof File) dataToSend.append("galleries", file);
        });
      }

      if (editingHouse) {
        const updated = await callApi(
          `${URL_ENDPOINTS.APARTMENT_LIST_URL}/${editingHouse.id}`,
          { method: "PUT", data: dataToSend, withCredentials: true }
        );
        setHouses(houses.map((h) => (h.id === editingHouse.id ? updated : h)));
      } else {
        const created = await callApi(`${URL_ENDPOINTS.APARTMENT_LIST_URL}`, {
          method: "POST",
          data: dataToSend,
          withCredentials: true,
        });
        setHouses([...houses, created]);
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
          <h1 className="text-2xl font-bold text-black">Quản lý nhà trọ</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Thêm nhà trọ
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : houses.length === 0 ? (
          <p className="text-gray-500">Chưa có nhà trọ nào.</p>
        ) : (
          <div className="rounded-xl border border-black overflow-hidden">
            <table className="w-full text-left text-black">
              <thead className="bg-gray-100">
                <tr className="text-center">
                  <th className="p-2 border-r border-b">Tên</th>
                  <th className="p-2 border-r border-b">Địa chỉ</th>
                  <th className="p-2 border-r border-b">Số phòng</th>
                  <th className="p-2 border-r border-b">Số phòng trống</th>
                  <th className="p-2 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((house) => (
                  <tr key={house.id} className="last:[&>td]:border-b-0">
                    <td className="p-2 border-r border-b">
                      <Link href={`/apartment/${house.id}/rooms`} className="text-blue-600">
                        {house.name}
                      </Link>
                    </td>
                    <td className="p-2 border-r border-b">
                      {house.address}, {house.ward.name}, {house.district.name},{" "}
                      {house.province.name}
                    </td>
                    <td className="p-2 border-r border-b text-center">
                      {house.totalRooms ?? 0}
                    </td>
                    <td className="p-2 border-r border-b text-center">
                      {house.emptyRooms ?? 0}
                    </td>
                    <td className="p-2 border-b text-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(house)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
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
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4 text-black">
              {editingHouse ? "Sửa nhà trọ" : "Thêm nhà trọ"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-black max-h-90 overflow-y-auto">
                <div>
                  <label className="block mb-1">Tên nhà trọ</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div className="mt-2">
                  <label className="block mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>

                <div className="mt-2">
                  <label className="block mb-1">Tỉnh / Thành phố</label>
                  <select
                    value={formData.province_id}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p.province_id} value={p.province_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <label className="block mb-1">Quận / Huyện</label>
                  <select
                    value={formData.district_id}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                    disabled={!formData.province_id}
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((d) => (
                      <option key={d.district_id} value={d.district_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <label className="block mb-1">Phường / Xã</label>
                  <select
                    value={formData.ward_id}
                    onChange={(e) =>
                      setFormData({ ...formData, ward_id: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                    disabled={!formData.district_id}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w) => (
                      <option key={w.ward_id} value={w.ward_id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
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
                  {editingHouse ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
