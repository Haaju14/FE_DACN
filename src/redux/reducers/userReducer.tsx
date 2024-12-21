import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  USER_LOGIN,
  getDataJsonStorage,
  removeDataJsonStorage,
  removeDataTextStorage,
} from "../../util/utilMethod";

interface User {
  IDNguoiDung: number;
  TenDangNhap: string;
  Email: string;
  MatKhau: string;
  HoTen: string;
  GioiTinh: boolean;
  SDT: string;
  Role: string;
  AnhDaiDien?: string;
}

export interface UserReducerType {
  token: string | undefined; // Đặt là string hoặc undefined
  userLogin: UserLogin | null;
}

export interface UserLogin {
  user: User;
  token: string;
}

const initialState: UserReducerType = {
  userLogin: getDataJsonStorage(USER_LOGIN),
  token: undefined,
};

const authReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserLogin>) => {
      console.log("Reducer login nhận dữ liệu:", action.payload);
      if (!action.payload || !action.payload.user) {
        console.error("Dữ liệu không hợp lệ:", action.payload);
        return;
      }
      state.userLogin = action.payload;
      state.token = action.payload.token;
      localStorage.setItem(USER_LOGIN, JSON.stringify(action.payload));
    },
    
    logout: (state) => {
      console.log("Logout reducer được gọi!"); // Kiểm tra xem logout có vô tình bị gọi không
      state.userLogin = null;
      state.token = undefined;
      removeDataTextStorage(USER_LOGIN);
      removeDataJsonStorage(USER_LOGIN);
    },

  },
});

export const { login, logout } = authReducer.actions;
export default authReducer.reducer;
