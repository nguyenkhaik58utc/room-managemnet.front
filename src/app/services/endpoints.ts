export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const URL_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  FORGOT_PASSWOED: "/api/auth/forgot-password",
  RESET_PASSWOED: "/api/auth/reset-password",
  REFRESH_TOKEN: "/api/auth/refresh",
  APARTMENT_LIST_URL: "/api/apartments",
  ADDRESS_PROVINCES: "/api/address/provinces",
  ADDRESS_DISTRICTS: "/api/address/districts",
  ADDRESS_WARDS: "/api/address/wards/by-district",
  ROOM_LIST_URL: "/api/room-apartments",
};