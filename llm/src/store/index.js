import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatStore/chatStore";

export default configureStore({
  reducer: {
    "chat-store": chatReducer,
  },
});
