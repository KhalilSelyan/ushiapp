import React from "react";
import Sheet, { SheetRef } from "react-modal-sheet";

function ChatSheet() {
  const sheetRef = React.useRef<SheetRef>(null);

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
          <Sheet.Header />
          <Sheet.Content>
            <div className="no-scrollbar flex h-full w-full  flex-col space-y-2 overflow-y-scroll rounded-t-lg bg-gray-900 p-2 ">
              <div className=" no-scrollbar flex h-full w-full  flex-col space-y-2 overflow-y-scroll rounded-t-lg bg-gray-900 p-2 "></div>
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
