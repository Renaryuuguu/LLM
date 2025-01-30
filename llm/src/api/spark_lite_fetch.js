const url = "api/v1/chat/completions";
const method = "POST";
const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer viSMGoufLRBfgvTzKrWS:jRGcrKPPguqZfgDPhZLp",
};
const body = {
  model: "lite",
  messages: [
    {
      role: "user",
    },
  ],
};
const requestInit = (content) => {
  body.messages[0].content = content;
  return {
    method,
    headers,
    body: JSON.stringify(body),
  };
};

const streamRequestInit = (content) => {
  body.messages[0].content = content;
  body.stream = true;
  return {
    method,
    headers,
    body: JSON.stringify(body),
  };
};

export const liteUserChat = (content) => fetch(url, requestInit(content));
export const liteUserChatStream = (content) =>
  fetch(url, streamRequestInit(content));
