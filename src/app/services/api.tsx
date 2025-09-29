// src/app/services/api.ts

import { URL_ENDPOINTS } from "./endpoints";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  data?: any;
  token?: string; 
  withCredentials?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function callApi(endpoint: string, options: RequestOptions = {}, retry = true) {
  const { method = "GET", data, withCredentials } = options;

  let token = sessionStorage.getItem("access_token");

  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let body: BodyInit | undefined;

  if (data instanceof FormData) {
    body = data;
  } else if (data) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
    credentials: withCredentials ? "include" : "omit",
  });

  if (res.status === 401 && retry) {
    try {
      const refreshRes = await fetch(`${BASE_URL}${URL_ENDPOINTS.REFRESH_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh token failed");
      }

      const refreshData = await refreshRes.json();
      if (refreshData.access_token) {
        sessionStorage.setItem("access_token", refreshData.access_token);
        token = refreshData.access_token;

        return callApi(endpoint, options, false);
      }
    } catch (err) {
      throw new Error("Token expired, please login again");
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || res.statusText);
  }

  return res.json();
}

