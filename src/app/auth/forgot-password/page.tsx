"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { callApi } from "../../services/api";
import { URL_ENDPOINTS } from "../../services/endpoints";
import Link from "next/link";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // 👈 thêm state error
  const [successMessage, setSuccessMessage] = useState(""); // 👈 thêm state success

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendEmail = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Vui lòng nhập email!");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("Email không hợp lệ!");
      return;
    }

    await callApi(URL_ENDPOINTS.FORGOT_PASSWOED, {
      method: "POST",
      data: { email },
    });

    setSuccessMessage(`Đã gửi link reset tới email: ${email}`);
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp!");
      return;
    }

    await callApi(URL_ENDPOINTS.RESET_PASSWOED, {
      method: "POST",
      data: { token, newPassword: password },
    });

    setSuccessMessage("Mật khẩu đã được đổi thành công!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        {!token ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-black">Quên mật khẩu</h2>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-2 text-black"
              required
            />

            {errorMessage && (
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}

            {successMessage && (
              <div className="text-sm mb-2">
                <p className="text-green-600">{successMessage}</p>
                <Link
                  href="/login"
                  className="text-blue-500 underline ml-1 hover:text-blue-700"
                >
                  Về trang đăng nhập
                </Link>
              </div>
            )}

            <button
              onClick={handleSendEmail}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Gửi liên kết đặt lại mật khẩu
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-black">
              Đặt lại mật khẩu
            </h2>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
              required
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 text-sm mb-2">{successMessage}</p>
            )}

            <button
              onClick={handleResetPassword}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Đổi mật khẩu
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
