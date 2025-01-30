import React from "react";
import { Button } from "antd";
import ChatMessage from "./components/chat-message/chat-message";
import MessageList from "./components/message-list/message-list";
const App = () => (
  <div className="App">
    <Button type="primary">Button</Button>
    <ChatMessage />
    <MessageList />
  </div>
);

export default App;
