import Chat from "@/components/chat";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <Chat
      NEXT_PUBLIC_CHATSERVICE_IP={process.env.NEXT_PUBLIC_CHATSERVICE_IP}
      NEXT_PUBLIC_WEBSOCKET_PORT={process.env.NEXT_PUBLIC_WEBSOCKET_PORT}
    ></Chat>
  );
}
