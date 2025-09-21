"use client";

import React, { Suspense, useState } from "react";
import { callApi } from "../services/api";
import { URL_ENDPOINTS } from "../services/endpoints";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  function LoginContent() {
    const searchParams = useSearchParams();
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    if (verified) {
      return <p className="text-green-600">
        Xác minh email thành công! Vui lòng đăng nhập.
      </p>
    }
    if (error === "invalid_token") {
      return <p className="text-red-600">
        Link xác minh không hợp lệ hoặc đã hết hạn.
      </p>
    }
    if (error === "server_error") {
      return <p className="text-red-600">Có lỗi xảy ra, vui lòng thử lại sau.</p>
    }
  }

  // State form
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    if (isLogin) {
      try {
        const res = await callApi(URL_ENDPOINTS.LOGIN, {
          method: "POST",
          data: { email, password },
        });
        router.push("/apartment");
      } catch (err: any) {
        alert("Lỗi: " + err.message);
      }
      setIsSubmitting(false);
    } else {
      try {
        const res = await callApi(URL_ENDPOINTS.REGISTER, {
          method: "POST",
          data: { name, email, password },
        });

        alert("Đã gửi mail xác minh");
      } catch (err: any) {
        alert("Lỗi: " + err.message);
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <span
          className={`text-sm font-medium ${isLogin ? "text-black" : "text-gray-400"
            }`}
        >
          Login
        </span>

        <button
          onClick={handleToggle}
          className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${isLogin ? "bg-blue-500 justify-start" : "bg-gray-300 justify-end"
            }`}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
        </button>

        <span
          className={`text-sm font-medium ${!isLogin ? "text-black" : "text-gray-400"
            }`}
        >
          Sign Up
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h1>

        <Suspense fallback={<div>Loading...</div>}>
          <LoginContent />
        </Suspense>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isLogin && (
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline cursor-pointer"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
