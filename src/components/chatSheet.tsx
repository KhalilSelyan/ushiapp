import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import Sheet, { SheetRef } from "react-modal-sheet";
import { guestViewMessages, hostViewMessages } from "../jotai/jotai";

function ChatSheet() {
  const sheetRef = React.useRef<SheetRef>(null);
  const hostViewChat = useAtomValue(hostViewMessages);
  const guestViewChat = useAtomValue(guestViewMessages);

  useEffect(() => {
    console.log(guestViewChat);
  }, [guestViewChat]);

  return (
    <>
      <Sheet
        ref={sheetRef}
        isOpen
        onClose={() => {
          sheetRef.current?.snapTo(1);
        }}
        snapPoints={[250, 40]}
        initialSnap={1}
      >
        <Sheet.Container
          style={{
            backgroundColor: "#111827",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Sheet.Header>
            <div className="flex w-full items-center justify-center space-x-8 text-white">
              <span
                className="mt-1 cursor-pointer rounded bg-gray-400 px-2 text-lg font-bold"
                onClick={() => {
                  sheetRef.current?.snapTo(0);
                }}
              >
                Open
              </span>
              <span
                className="mt-1 cursor-pointer rounded bg-gray-400 px-2 text-lg font-bold"
                onClick={() => {
                  sheetRef.current?.snapTo(1);
                }}
              >
                Close
              </span>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div className="no-scrollbar flex h-full w-full  flex-col space-y-2 overflow-y-scroll rounded-t-lg bg-gray-900 p-2 ">
              <div
                id="chat-container"
                className=" no-scrollbar flex h-full w-full  flex-col space-y-2 overflow-y-scroll rounded-t-lg bg-gray-900 p-2 "
              >
                {hostViewChat.map((message, index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-full items-center justify-start space-x-2"
                    >
                      <span className="text-sm font-bold text-[#9b5e33]">
                        {message.name} :{" "}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {message.message}
                      </span>
                    </div>
                  );
                })}
                {guestViewChat.map((message, index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-full items-center justify-start space-x-2"
                    >
                      <span className="text-sm font-bold text-[#9b5e33]">
                        {message.name} :{" "}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {message.message}
                      </span>
                    </div>
                  );
                })}
              </div>
              <input
                id="chat-input"
                autoComplete="off"
                type="text"
                className="w-full rounded-b-lg border-none bg-gray-800 p-2 px-4 text-[#9b5e33] placeholder:text-[#9b5e33] focus:outline-none"
                placeholder="Type a message"
              />
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default ChatSheet;
