import { createSlice } from "@reduxjs/toolkit";

export const getMessageObj = (content, role) => {
  return {};
};

export const chatSlice = createSlice({
  name: "chat-store",
  initialState: {
    chats: [
      {
        chat_id: 0,
        chat_name: "",
        messages: [
          [
            {
              message_id: "0",
              role: "user",
              content: ["你好，欢迎来到字节青训！"],
            },
          ],
          [
            {
              message_id: "1",
              role: "assistant",
              content: ["第一个回答"],
            },
            {
              message_id: "2",
              role: "assistant",
              content: ["第二个回答"],
            },
          ],
        ],
      },
    ],
  },
  reducers: {},
});
export default chatSlice.reducer;
