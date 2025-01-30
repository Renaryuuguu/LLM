import { Avatar, Button, Card, Space } from "antd";
import React, { useEffect, useState } from "react";
import { liteUserChat, liteUserChatStream } from "../../api/spark_lite_fetch";
import styles from "./css/chat-message.module.css";
import { Marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { markedHighlight } from "marked-highlight";
import "github-markdown-css/github-markdown.css";

const marked = new Marked();
// markedHighlight({
//   emptyLangClass: "hljs",
//   langPrefix: "hljs language-",
//   highlight: (code, lang, info) => {
//     const language = hljs.getLanguage(lang) ? lang : "plaintext";
//     console.log(language);
//     return hljs.highlight(code, { language }).value;
//   },
// })
// const marked = new Marked({
//   gfm: true,
// });
marked.setOptions({
  // renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

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

const ChatMessage = () => {
  const [message, setMessage] = useState("");
  const [streamMessage, setStreamMessage] = useState("");
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
  return (
    <Space direction="vertical">
      <Button type="primary" onClick={testStream}>
        ChatMessage
      </Button>
      <div
        className={"markdown-body"}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(marked.parse(streamMessage)),
        }}
      />
      <Button type="primary" onClick={testNormal}>
        ChatMessage
      </Button>
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(marked.parse(message)),
        }}
      />
    </Space>
  );
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
