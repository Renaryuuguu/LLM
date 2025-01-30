import axios from "../api";

export const liteUserChat = (content) =>
  axios.post("/v1/chat/completions", {
    model: "lite",
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });
export const liteUserChatStream = (content) =>
  axios.post("/v1/chat/completions", {
    model: "lite",
    messages: [
      {
        role: "user",
        content,
      },
    ],
    stream: true,
  });
