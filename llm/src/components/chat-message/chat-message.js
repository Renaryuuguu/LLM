import { Avatar, Button, Card, message, Space } from "antd";
import React, { useEffect, useRef, useState } from "react";
// import { liteUserChat, liteUserChatStream } from "../../api/spark_lite_fetch";
// import styles from "./css/chat-message.module.css";
import { Marked } from "marked";
import DOMPurify from "dompurify";
// import hljs from "highlight.js";
// import "highlight.js/styles/github.css";
import { markedHighlight } from "marked-highlight";
// import "github-markdown-css/github-markdown-light.css";
import { useSelector } from "react-redux";
import { common, createStarryNight } from "@wooorm/starry-night";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import "highlight.js/styles/github-dark.css";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import styles from "./css/chat-message.module.css";
import "./css/chat-message.css";
import "@ant-design/v5-patch-for-react-19";

const markdown_test = `**可以将 \`session\` 和 \`message\` 分开存储到不同的 Redux Slice，甚至不同的 IndexedDB 表，来简化数据结构**。但在分离时，需要 **合理管理数据依赖**，否则会出现 **不同步** 或 **状态不一致** 的问题。  

---

# **✅ 如何拆分 \`session\` 和 \`message\`**
## **🌟 方案：拆分为两个 Redux Slice**
- **\`sessionSlice\`**: 负责管理 **会话列表**（\`sessions\`）。
- **\`messageSlice\`**: 负责管理 **每个会话的消息**（\`messages\`）。

这样可以 **降低 Redux Store 的复杂度**，但需要确保 \`message\` 仍然能找到 \`session\`。

---

## **📝 1. 代码实现**
### **📌 \`sessionSlice.js\` (管理聊天会话)**
\`\`\`tsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessions: [], // 会话列表
  currentSessionId: null, // 当前选中的会话
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    addSession(state, action) {
      const newSession = action.payload; // { id, topic, lastUpdate }
      state.sessions.push(newSession);
      state.currentSessionId = newSession.id; // 默认选中新会话
    },
    setCurrentSession(state, action) {
      state.currentSessionId = action.payload; // 切换会话
    },
  },
});

export const { addSession, setCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;
\`\`\`
---

### **📌 \`messageSlice.js\` (管理聊天记录)**
\`\`\`javascript
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: {}, // { sessionId1: [...], sessionId2: [...] }
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage(state, action) {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }
      state.messages[sessionId].push(message);
    },
    clearMessages(state, action) {
      const { sessionId } = action.payload;
      delete state.messages[sessionId];
    },
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
\`\`\`
---

### **📌 \`store.js\` (合并 \`session\` 和 \`message\`)**
\`\`\`javascript
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./sessionSlice";
import messageReducer from "./messageSlice";

const store = configureStore({
  reducer: {
    session: sessionReducer,
    message: messageReducer,
  },
});

export default store;
\`\`\`

---

## **🛠 2. 数据存储优化**
### **🔹 IndexedDB 存储 \`session\` 和 \`message\`**
可以 **单独存储 \`session\` 和 \`message\`**，避免状态数据过于庞大：
\`\`\`javascript
import { openDB } from "idb";

const DB_NAME = "chatDB";
const SESSION_STORE = "sessions";
const MESSAGE_STORE = "messages";

// 初始化数据库
async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
        db.createObjectStore(MESSAGE_STORE, { keyPath: "sessionId" });
      }
    }
  });
}

// 存储 \`sessions\`
async function saveSession(session) {
  const db = await initDB();
  await db.put(SESSION_STORE, session);
}

// 存储 \`messages\`
async function saveMessages(sessionId, messages) {
  const db = await initDB();
  await db.put(MESSAGE_STORE, { sessionId, messages });
}

// 读取 \`sessions\`
async function getSessions() {
  const db = await initDB();
  return await db.getAll(SESSION_STORE);
}

// 读取 \`messages\`
async function getMessages(sessionId) {
  const db = await initDB();
  return await db.get(MESSAGE_STORE, sessionId);
}
\`\`\`
---

## **🎯 3. 为什么这样拆分？**
### **✅ 优势**
1. **更清晰的 Redux 结构**
   - \`sessionSlice\` 只管理会话，\`messageSlice\` 只管理消息，解耦。
2. **减少 Redux 状态大小**
   - \`session\` 数量少，适合存 Redux。
   - \`messages\` 可能很多，存 IndexedDB 更合理。
3. **更容易管理本地存储**
   - \`session\` 存 \`localStorage\` 或 IndexedDB 的 \`sessions\` 表。
   - \`message\` 存 IndexedDB 的 \`messages\` 表，避免 Redux 状态膨胀。

### **⚠️ 可能的 Bug**
- **会话和消息不同步**
  - 需要确保 **删除会话时，也删除该会话的消息**：
    \`\`\`javascript
    store.dispatch(clearMessages({ sessionId }));
    \`\`\`
- **切换会话后消息不显示**
  - 确保 UI 组件监听 \`currentSessionId\` 变化，并从 IndexedDB 读取对应 \`messages\`：
    \`\`\`javascript
    useEffect(() => {
      if (currentSessionId) {
        getMessages(currentSessionId).then(setMessages);
      }
    }, [currentSessionId]);
    \`\`\`

---

## **🚀 结论**
✅ **拆分 \`session\` 和 \`message\` 是可行的，并且是更好的做法！**  
- \`session\` 存 Redux，管理会话列表  
- \`message\` 存 IndexedDB，避免 Redux 变大  
- Redux + IndexedDB 结合，**减少性能消耗**，**避免数据丢失**  

这样你的 **AI 聊天系统** 在 **多会话管理、消息存储、性能优化** 方面都更合理！ 🚀`;

// marked.use({ gfm: true, breaks: true, smartypants: true });
const decodeResponse = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  return decoder.decode(value);
};

const getContent = async (response) => {
  let resStr = await decodeResponse(response);
  resStr = resStr.replace("data: ", "");
  console.log(resStr);
  const assistantMessage = JSON.parse(resStr);
  const { choices } = assistantMessage;
  if (choices.length > 0) {
    const { content } = choices[0].message;
    return content;
  }
  // return assistantMessage;
};

function PreCode(props) {
  const { children, ...rest } = props;
  const preRef = useRef();
  const reg = /language-(\w+)/;
  const codeLanguage = reg.exec(children.props.className)?.[1];

  return (
    <pre ref={preRef} {...rest}>
      <div className={styles["code-wrapper"]}>
        <div>{codeLanguage}</div>
        <div>
          <Button
            onClick={() => {
              // console.log(preRef.current.querySelector("code").innerText);
              const copyedCode = preRef.current.querySelector("code").innerText;
              navigator.clipboard.writeText(copyedCode);
              message.success("复制成功");
              console.log("copyed");
            }}
            size="small"
            icon={<CopyOutlined />}
          ></Button>
        </div>
      </div>
      {children}
    </pre>
  );
}

const ChatMessage = ({ content, role }) => {
  const [isCopyed, setIsCopyed] = useState(false);
  const handleCopyClick = () => {
    setIsCopyed(true);
  };
  /*
  const [message, setMessage] = useState("");
  const [streamMessage, setStreamMessage] = useState("");
  const chats = useSelector((state) => state["chat-store"].chats);
  console.log(chats);
  const handleClick = async () => {
    console.log("click");
    let content = "你好，你的名字是？";
    const response = await liteUserChat(content);
    console.log(response.data?.choices?.[0]?.message?.content);
    return response.data?.choices?.[0]?.message?.content;
  };
  const testStream = async () => {
    const response = await liteUserChatStream("请用javascript实现防抖函数");
    // const response = await liteUserChatStream("你好，你的名字是？");
    let buffer = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value } = await reader.read();
      let chunk = decoder.decode(value, { stream: true });
      chunk = chunk.replace("data: ", "");
      if (chunk.includes("[DONE]")) {
        break;
      }
      // console.log(chunk);
      const data = JSON.parse(chunk);
      const example = {
        code: 0,
        message: "Success",
        sid: "cha000bd096@dx194b5525afcb8f2532",
        id: "cha000bd096@dx194b5525afcb8f2532",
        created: 1738208861,
        choices: [
          {
            delta: { role: "assistant", content: "您好，我是科大讯" },
            index: 0,
          },
        ],
      };
      const { choices } = data;
      if (choices.length > 0) {
        const { content } = choices[0].delta;
        buffer += content;
        // buffer += marked.parse(content);
        setStreamMessage(buffer);
        console.log(content);
      }
    }
    console.log(buffer);
    // return {
    //   async *[Symbol.asyncIterator]() {
    //     while (true) {
    //       const { value, done } = await reader.read();
    //       if (done) {
    //         return;
    //       }
    //       yield decoder.decode(value, { stream: true });
    //     }
    //   },
    // };
  };
  const testNormal = async () => {
    const response = await liteUserChat("请用javascript实现防抖函数");
    const content = await getContent(response);
    setMessage(content);
  };
  useEffect(() => {
    // setMessage(handleClick());
    // setMessage(testStream());
    // console.log(testStream());
    // const fetchStreamData = async () => {
    //   const stream = await testStream(); // 等待testStream返回对象
    //   const iterator = stream[Symbol.asyncIterator](); // 提取异步迭代器
    //   let accumulatedMessage = "";
    //   for await (const chunk of iterator) {
    //     accumulatedMessage += chunk;
    //     console.log(accumulatedMessage);
    //     setMessage(accumulatedMessage); // 更新状态以显示累积的流式数据
    //   }
    // };
    // fetchStreamData();
  }, []);
  */
  return (
    <Space direction="vertical" size="small">
      <div className={styles["markdown-body"]}>
        <Markdown
          // 使用remarkGfm插件来支持GitHub Flavored Markdown
          remarkPlugins={[remarkGfm]}
          // 使用RehypeHighlight插件来支持代码高亮
          rehypePlugins={[
            [
              RehypeHighlight,
              {
                // 自动检测代码语言
                detect: true,
                // 忽略缺失的语言定义
                ignoreMissing: true,
              },
            ],
          ]}
          components={{
            pre: PreCode,
          }}
        >
          {markdown_test}
        </Markdown>
      </div>
      <Space direction="horizontal">
        {isCopyed ? (
          <Button icon={<CheckOutlined />}></Button>
        ) : (
          <Button onClick={handleCopyClick} icon={<CopyOutlined />}></Button>
        )}
      </Space>
    </Space>
  );
  // return (
  //   <Space direction="vertical">
  //     <Button type="primary" onClick={testStream}>
  //       ChatMessage
  //     </Button>
  //     <div
  //       className={"markdown-body"}
  //       dangerouslySetInnerHTML={{
  //         __html: DOMPurify.sanitize(marked.parse(streamMessage)),
  //       }}
  //     />
  //     <Button type="primary" onClick={testNormal}>
  //       ChatMessage
  //     </Button>
  //     <div
  //       dangerouslySetInnerHTML={{
  //         __html: DOMPurify.sanitize(marked.parse(message)),
  //       }}
  //     />
  //     {/* {chats} */}
  //   </Space>
  // );
  // return (
  //   <>
  //     <div className={styles["chat-box"]}>
  //       <p>123</p>
  //       <p>123</p>
  //       <p>123</p>
  //     </div>
  //     <div className={styles["chat-box"]}>
  //       <div className={styles["user-avatar"]}>
  //         <Avatar
  //           size="large"
  //           src="https://api.dicebear.com/7.x/miniavs/svg?seed=8"
  //         />
  //       </div>
  //       <div className={styles["user-message"]}>
  //         I'm interviewing a candidate for a marketing manager position at an
  //         e-commerce company. The ideal candidate should have experience
  //         developing and executing multi-channel marketing campaigns, strong
  //         analytical skills, and the ability to collaborate effectively with
  //         cross-functional teams. They should also be passionate about staying
  //         up-to-date with the latest marketing trends and technologies. Your
  //         task is to generate a series of thoughtful, open-ended questions for
  //         an interview based on the given context. The questions should be
  //         designed to elicit insightful and detailed responses from the
  //         interviewee, allowing them to showcase their knowledge, experience,
  //         and critical thinking skills. Avoid yes/no questions or those with
  //         obvious answers. Instead, focus on questions that encourage
  //         reflection, self-assessment, and the sharing of specific examples or
  //         anecdotes.
  //         <p>{message}</p>
  //       </div>
  //     </div>
  //   </>
  // );
};
export default ChatMessage;
