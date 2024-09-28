"use client";

import { useEffect, useMemo, useState } from "react";
import { SocketMessage } from "../socket";
import { io } from "socket.io-client";

export default function Chat(props: {
  NEXT_PUBLIC_CHATSERVICE_IP?: string;
  NEXT_PUBLIC_WEBSOCKET_PORT?: string;
}) {
  const [isConnected, setIsConnected] = useState(false);
  // const [transport, setTransport] = useState("N/A");

  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [name, setName] = useState<string>("");

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const { NEXT_PUBLIC_WEBSOCKET_PORT, NEXT_PUBLIC_CHATSERVICE_IP } = props;

  const socket = useMemo(
    () =>
      io(
        `http://${NEXT_PUBLIC_CHATSERVICE_IP || "localhost"}:${
          NEXT_PUBLIC_WEBSOCKET_PORT || 3002
        }`,
        { autoConnect: false }
      ),
    [NEXT_PUBLIC_CHATSERVICE_IP, NEXT_PUBLIC_WEBSOCKET_PORT]
  );

  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      // setTransport(socket.io.engine.transport.name);

      // socket.io.engine.on("upgrade", (transport) => {
      //   setTransport(transport.name);
      // });
    }

    function onDisconnect() {
      setIsConnected(false);
      // setTransport("N/A");
      // throw new Error('')
      // addSnackbar({
      //         key: "error",
      //         text: "This is a error snackbar",
      //         variant: "error",
      //         icon: ExclamationCircleIcon
      //       })
    }

    function onMessages(message: SocketMessage) {
      setMessages((prevMessages) => {
        return [...prevMessages.slice(), message];
      });
    }

    function onErrors(error: string) {
      setErrorMessages((prev) => [...prev.slice(), error.toString()]);
      setTimeout(() => {
        setErrorMessages((prev) => [...prev.slice(1)]);
      }, 5000);
    }

    socket.on("messages", onMessages);
    socket.on("errors", onErrors);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("messages", onMessages);
      socket.off("errors", onErrors);
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = () => {
    socket.emit("message", { payload: newMessage, name: name });
    setNewMessage("");
    setMessages((prevMessages) => {
      return [...prevMessages.slice(), { from: name, message: newMessage }];
    });
  };

  const startChatAs = () => {
    setName(name);
    setMessages([]);
    socket.emit("get_history", { name: name });
  };

  return (
    <div className="flex flex-col items-center justify-center w-[100vw] h-[100vh]">
      <div
        className="absolute top-5 right-5 text-red-700"
        style={{ display: isConnected ? "none" : "block " }}
      >
        NOT CONNECTED
      </div>
      {errorMessages.map((e, i) => (
        <div
          key={i}
          className="absolute right-5 text-red-700"
          style={{
            display: errorMessages.length > 0 ? "block" : "none",
            top: 20 * i + 10,
          }}
        >
          {" "}
          {e}{" "}
        </div>
      ))}

      <div>
        <h1 className="text-5xl mt-[2vh]">Chat</h1>
      </div>

      <div className="pt-[2vh]">
        <input
          className="h-[10vh] text-black w-10vw] h-[5vh] mr-[1vw]"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={!(name && isConnected)}
          style={{ opacity: name && isConnected ? "100%" : "50%" }}
          onClick={startChatAs}
        >
          Start Chat as {name}
        </button>
      </div>

      <div className="mt-[2vh] w-[80vw]">
        <div>
          <h1>Messages</h1>
        </div>
        <div className="overflow-auto h-[50vh] border-2 border-gray-400">
          {messages.map((message, index) => (
            <div className="text-white" key={index}>
              {message.from}: {message.message?.toString()}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-[4vh]">
        <textarea
          className="h-[10vh] text-black w-[60vw]"
          aria-multiline={true}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
      </div>

      <div className="mt-[2vh]">
        <button
          disabled={!(isConnected && newMessage && name)}
          style={{
            opacity: isConnected && newMessage && name ? "100%" : "50%",
          }}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
