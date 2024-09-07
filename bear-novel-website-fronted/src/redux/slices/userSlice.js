import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserInfo } from "../../api/user-api";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false, // 初始狀態為未登入
    user: null,
    status: "idle", //  'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    userLoaded: false, // 防止 status 更新為 "succeeded" 但 isLoggedIn 還沒有更新
  },
  reducers: {
    logout: (state) => {
      state.user = null; // 登出時清空 user 狀態
      state.isLoggedIn = false; // 更新為未登入狀態。
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.status = "loading";
        state.userLoaded = false; // 加載中
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isLoggedIn = true;
        state.userLoaded = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.userLoaded = true;
      });
  },
});

// 導出 action
export const { logout } = userSlice.actions;

export const getUser = createAsyncThunk(
  "user/getUser", // action type prefix
  async (_, { rejectWithValue }) => {
    try {
      const userData = await getUserInfo();
      return userData; // 返回的數據傳遞到 fulfilled 狀態
    } catch (error) {
      return rejectWithValue(error.message); // 返回錯誤信息, 會被傳遞到 rejected 狀態
    }
  }
);

export default userSlice.reducer;
