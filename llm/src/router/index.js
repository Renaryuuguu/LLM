import { createBrowserRouter } from "react-router-dom";
import ChatMessage from "../components/chat-message/chat-message";
import MessageList from "../components/message-list/message-list";

const router = createBrowserRouter([
  {
    path: "/",
    Component: ChatMessage,
  },
]);
export default router;
