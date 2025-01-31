import React from "react";
import { Button } from "antd";
import ChatMessage from "./components/chat-message/chat-message";
import MessageList from "./components/message-list/message-list";
import { Provider } from "react-redux";
import store from "./store/index";
import { RouterProvider } from "react-router-dom";
import router from "./router";
const App = () => (
  <Provider store={store}>
    {/* <div className="App">
      <Button type="primary">Button</Button>
      <ChatMessage />
      <MessageList />
    </div> */}
    <RouterProvider router={router} />
  </Provider>
);

export default App;
