import React, { useEffect } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { v4 as uuidv4 } from "uuid";
import ChatSheet from "../components/chatSheet";

function Test() {
  const [url, setUrl] = React.useState("");

  const [type, setType] = React.useState<"host" | "guest" | null>(null);

  const [socket, setSocket] = React.useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  const sourceRef = React.useRef<HTMLVideoElement>(null);

  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(sourceRef.current?.paused);
  const [roomNumber, setRoomNumber] = React.useState("0");
  const virtualId = uuidv4();

  const [hostMessages, setHostMessages] = React.useState<string[]>([]);
  const [guestMessages, setGuestMessages] = React.useState<string[]>([]);

  useEffect(() => {
    const ss:
      | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
      | any = io("https://ushi-back-production.up.railway.app/");
    // | any = io("http://localhost:3005/");
    setSocket(ss);
  }, []);

  useEffect(() => {
    if (sourceRef.current?.paused) {
      setIsPaused(true);
    } else setIsPaused(false);
  }, [sourceRef.current?.paused]);

  const [numberOfParticipants, setNumberOfParticipants] = React.useState(0);

  useEffect(() => {
    if (socket) {
      type === "host"
        ? socket.emit("host", {
            currentTime: currentTime,
            isPaused: isPaused,
            roomNumber: roomNumber,
            url: url,
            count: numberOfParticipants,

            // hostMessages: hostMessages,
            // guestMessages: guestMessages,
          })
        : socket.on(
            `watcher${roomNumber}`,
            (data: {
              currentTime: number;
              isPaused: boolean;
              roomNumber: string;
              url: string;

              // hostMessages: string[];
              // guestMessages: string[];
            }) => {
              setUrl(data.url);

              const video = sourceRef.current?.src;

              if (video !== data.url && sourceRef.current) {
                sourceRef.current.src = data.url;
                sourceRef.current.load();
              }

              if (sourceRef.current) {
                if (data.isPaused) {
                  sourceRef.current.pause();
                } else {
                  sourceRef.current.play();
                }
                if (
                  sourceRef.current.currentTime - data.currentTime > 0.5 ||
                  sourceRef.current.currentTime - data.currentTime < -0.5
                ) {
                  sourceRef.current.currentTime = data.currentTime;
                }
              }
            }
          );
    }
  }, [
    currentTime,
    guestMessages,
    hostMessages,
    isPaused,
    roomNumber,
    socket,
    url,
  ]);

  useEffect(() => {
    if (socket) {
      // emit to any one who joins the room host or guest the number of participants and also the room number and add the number of participants to the state
      // setNumberOfParticipants(numberOfParticipants + 1);
      if (roomNumber !== "0") {
        socket.emit("join", {
          virtualId: roomNumber,
        });
        socket.on(
          `joined${roomNumber}`,
          (data: { virtualId: string; count: number }) => {
            // console.log("joined", data);
            setNumberOfParticipants(data.count);
          }
        );
      }
    }
  }, [socket, roomNumber]);

  useEffect(() => {
    if (socket) {
      document
        .getElementById("chat-input")
        ?.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            const input = document.getElementById(
              "chat-input"
            ) as HTMLInputElement;
            if (input.value !== "") {
              if (type === "host") {
                socket.emit("chatMessage", {
                  message: input.value,
                  // virtualId: roomNumber,
                });
                //   setHostMessages([...hostMessages, input.value]);
                //   socket.emit("hostMessage", {
                //     message: input.value,
                //     roomNumber: roomNumber,
                //   });
                // } else {
                //   setGuestMessages([...guestMessages, input.value]);
                //   socket.emit("guestMessage", {
                //     message: input.value,
                //     roomNumber: roomNumber,
                //   });
              }
              input.value = "";
            }
          }
        });

      socket.on("message", (data: { message: string }) => {
        console.log("message", data);
      });
    }
  }, [roomNumber, hostMessages, guestMessages]);

  useEffect(() => {
    const oldUrl = sourceRef.current?.src;

    if (url !== oldUrl && sourceRef.current && type === "host") {
      sourceRef.current.src = url;
      sourceRef.current.load();
    }
  }, [url]);

  if (!type) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center space-x-4 space-y-32 bg-gray-700">
        {/* big letters website title */}
        <div className="text-2xl font-bold text-white md:text-6xl">
          Welcome to{" "}
          <span className="font-mono text-6xl font-bold md:text-9xl ">
            Ushi
          </span>
        </div>
        <div className="flex items-center justify-center space-x-4 bg-gray-700">
          <span className="text-white md:text-4xl">Are you a :</span>
          <button
            onClick={() => {
              setType("host");
              setRoomNumber(virtualId);
            }}
            className="rounded-md bg-blue-500 p-2 text-white"
          >
            Host
          </button>
          <span className="text-white md:text-4xl">Or a :</span>
          <button
            onClick={() => setType("guest")}
            className="rounded-md bg-blue-500 p-2 text-white"
          >
            Guest
          </button>
        </div>
      </div>
    );
  }

  if (type === "guest" && roomNumber === "0") {
    return (
      <div className="flex h-screen w-full items-center justify-center space-y-2 space-x-2 bg-gray-800 ">
        <div className="font-bold text-white md:text-2xl">Input room ID: </div>
        {/* Input room number */}
        <input
          type="text"
          className="h-11 rounded-lg border-none bg-gray-700 px-4 text-[#9b5e33] placeholder:text-[#9b5e33] focus:outline-none md:w-96 "
          onChange={(e) => {
            setTimeout(() => {
              setRoomNumber(e.target.value);
            }, 1000);
          }}
        />
      </div>
    );
  }

  if (roomNumber !== "0")
    return (
      <div className="no-scrollbar flex h-screen w-full flex-col items-center bg-gray-700 p-2">
        {/* input for user to enter the url */}
        {type === "host" && (
          <div className="flex w-full  items-center justify-center space-x-4 rounded-lg bg-gray-900 p-2 md:w-2/3">
            <span className="ml-2 text-sm font-bold text-[#9b5e33]">Url: </span>
            <input
              type="text"
              placeholder="Paste a url to an mp4 file"
              className="h-full w-full border-none bg-transparent px-4 text-[#9b5e33] placeholder:text-[#9b5e33] focus:outline-none "
              onChange={(event) => {
                const value = event.target.value as string;
                setTimeout(() => setUrl(value), 1000);
              }}
            />
          </div>
        )}

        <span className="mt-2 ml-2 text-sm font-bold text-white">
          Room Id:{" "}
          <span
            className="cursor-pointer font-mono font-bold text-white"
            onClick={() => {
              // copy the room number to the clipboard
              navigator.clipboard.writeText(roomNumber);
            }}
          >
            {roomNumber}
          </span>
        </span>
        <span className="text-sm font-bold text-white">
          Number of watchers: {numberOfParticipants}
        </span>
        <div className="relative flex h-4/5 w-full items-center justify-center rounded-xl bg-gray-500/5 p-2">
          <video
            ref={sourceRef}
            className="h-full min-h-full w-auto min-w-full max-w-none  border-2 border-black portrait:h-2/5 portrait:w-full landscape:h-full landscape:w-3/5"
            controls
            autoPlay
            onCanPlay={() => {
              // get the video current time
              setInterval(() => {
                setCurrentTime(sourceRef.current?.currentTime as number);
              }, 500);
            }}
          >
            <source src={url} type="video/mp4" />
          </video>
        </div>
        <ChatSheet />
      </div>
    );
}

export default Test;
