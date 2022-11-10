/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { v4 as uuidv4 } from "uuid";
import ChatSheet from "../components/chatSheet";
import { useDebounce } from "react-use";
import { guestViewMessages, hostViewMessages } from "../jotai/jotai";

function WatchPage() {
  const [url, setUrl] = React.useState("");

  const [type, setType] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const [] = useDebounce(
    () => {
      nameInputRef.current?.blur();
      setDebouncedValue(name);
    },
    1500,
    [name]
  );

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

  // array of objects with {type: "host" | "guest", message: string}
  const [guestViewMsg, setGuestViewMessages] = useAtom(guestViewMessages);

  useEffect(() => {
    const ss:
      | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
      // | any = io("https://ushi-back-production.up.railway.app/");
      | any = io("http://localhost:3005/");
    setSocket(ss);
  }, []);

  useEffect(() => {
    if (sourceRef.current?.paused) {
      setIsPaused(true);
    } else setIsPaused(false);
  }, [sourceRef.current?.paused]);

  useEffect(() => {
    if (socket && type) {
      socket.emit("join", { roomNumber, name });

      socket.on("user-connected", (data) => {
        console.log(data);
      });
      socket.on("newUser", (data) => {
        console.log(data);
      });
    }
  }, [roomNumber]);

  useEffect(() => {
    if (socket) {
      document
        .getElementById("chat-input")
        ?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const input = document.getElementById(
              "chat-input"
            ) as HTMLInputElement;
            if (input.value !== "") {
              socket.emit("chatMessage", {
                name: name,
                message: input.value,
              });
              // add the message to the jotai state to the old messages
              socket.on("message", (data) => {
                const newMessage = {
                  name: data.name,
                  message: data.message,
                };

                setGuestViewMessages((old) => [...old, newMessage]);
                // only add the message once to the state
              });
              input.value = "";
              input.focus();
              setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }, 200);
            }
          }
        });
      const chatContainer = document.getElementById(
        "chat-container"
      ) as HTMLDivElement;
    }
    if (socket) {
      if (type === "host") {
        socket.emit("host", {
          currentTime: currentTime,
          isPaused: isPaused,
          roomNumber: roomNumber,
          url: url,
        });
      } else {
        socket.on(
          `watcher`,
          (data: {
            currentTime: number;
            isPaused: boolean;
            roomNumber: string;
            url: string;
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
                sourceRef.current.currentTime - data.currentTime > 1.5 ||
                sourceRef.current.currentTime - data.currentTime < -1.5
              ) {
                sourceRef.current.currentTime = data.currentTime;
              }
            }
          }
        );
      }
    }
  }, [currentTime, , isPaused, roomNumber, socket, url]);
  useEffect(() => {
    const oldUrl = sourceRef.current?.src;

    if (url !== oldUrl && sourceRef.current && type === "host") {
      sourceRef.current.src = url;
      sourceRef.current.load();
    }
  }, [url]);

  if (!type) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center space-x-4 space-y-16 bg-gray-800">
        {/* big letters website title */}
        <div className="text-2xl font-bold text-white md:text-6xl">
          Welcome to{" "}
          <span className="font-mono text-6xl font-bold md:text-9xl ">
            Ushi
          </span>
        </div>
        <div>
          <span className="font-bold text-white md:text-2xl">Name: </span>
          <input
            ref={nameInputRef}
            type="text"
            className="h-11 rounded-lg border-none bg-gray-700 px-4 text-[#9b5e33] placeholder:text-[#9b5e33] focus:outline-none md:w-96 "
            onChange={({ currentTarget }) => {
              setName(currentTarget.value);
            }}
          />
        </div>
        <div className="flex items-center justify-center space-x-4 ">
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
          autoComplete="off"
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
          <div className="flex w-full  items-center justify-center space-x-4 divide-x-2 rounded-lg bg-gray-900 p-2 md:w-2/3">
            <span className="ml-2 text-sm font-bold text-[#9b5e33]">Url: </span>
            <input
              type="text"
              autoComplete="off"
              placeholder="Paste a url to an mp4 file"
              className="h-full w-full border-none bg-transparent px-4 text-[#9b5e33] placeholder:text-[#9b5e33] focus:outline-none "
              onChange={(event) => {
                const value = event.target.value as string;
                setTimeout(() => setUrl(value), 1000);
              }}
            />
            <span className="pl-2 text-xs font-bold text-[#ac856a]">
              {" "}
              Clicking on the room id will copy it to your clipboard
            </span>
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
        {/* <span className="text-sm font-bold text-white">
          Number of watchers: {numberOfParticipants}
        </span> */}
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

export default WatchPage;
