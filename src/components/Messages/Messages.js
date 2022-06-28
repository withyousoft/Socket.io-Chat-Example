import React from "react";
import "./Messages.css";
import ScrollToBottom from "react-scroll-to-bottom";
import Message from "./Message/Message";

function Messages({ messages, name, users }) {
  return (
    <ScrollToBottom className="messages">
      {messages.map((message, i) => {
        const newMessage = {
          user:
            message.socketId === "admin"
              ? "admin"
              : users.find((el) => el.socketId === message.socketId).identifier,
          text: decodeURI(message.text),
        };
        return (
          <div key={i}>
            <Message message={newMessage} name={name} />
          </div>
        );
      })}
    </ScrollToBottom>
  );
}

export default Messages;
