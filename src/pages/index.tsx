import React, { useEffect } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { v4 as uuidv4 } from "uuid";

function Test() {
  const [url, setUrl] = React.useState("");

  const [type, setType] = React.useState<"host" | "guest" | null>(null);

  const [socket, setSocket] = React.useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
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
      | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
      | any = io("https://ushi-back-production.up.railway.app/");
    setSocket(ss);
  }, []);

  useEffect(() => {
    if (sourceRef.current?.paused) {
      setIsPaused(true);
    } else setIsPaused(false);
  }, [sourceRef.current?.paused]);

  useEffect(() => {
    if (socket) {
      type === "host"
        ? socket.emit("host", {
          currentTime: currentTime,
          isPaused: isPaused,
          roomNumber: roomNumber,
          url: url,
          type: type,
          // hostMessages: hostMessages,
          // guestMessages: guestMessages,
        })
        : socket.on("watcher", (data) => {

          if (data.roomNumber === roomNumber) {
            setUrl(data.url);

            const video = sourceRef.current?.src;


            if (video !== data.url) {
              sourceRef.current!.src = data.url;
              sourceRef.current!.load();
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
        });
    }
  }, [currentTime, guestMessages, hostMessages, isPaused]);

  useEffect(() => {
    const oldUrl = sourceRef.current?.src

    if (url !== oldUrl && sourceRef.current && type === "host") {
      sourceRef.current.src = url;
      sourceRef.current.load();
    }


  }, [url])


  if (!type) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-x-2">
        <button
          onClick={() => {
            setType("host");
            setRoomNumber(virtualId);
          }}
        >
          Host
        </button>
        <button onClick={() => setType("guest")}>Guest</button>
      </div>
    );
  }

  if (type === "guest" && roomNumber === "0") {
    return (
      <div className="flex h-screen w-full items-center justify-center space-x-2 bg-sky-400">
        <span>Input room Number: </span>
        {/* Input room number */}
        <input
          type="text"
          className="rounded-md border-2 border-black p-2"
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
      <div className="flex h-screen w-full flex-col items-center overflow-scroll bg-blue-200 p-4">
        {/* input for user to enter the url */}
        {type === "host" && <div className="flex w-full items-center justify-center space-x-2">
          <span>Url:</span>
          <input
            type="text"
            className="h-10 w-1/2 border-2 border-black"
            onChange={(event) => {
              // wait for user to finish typing
              const value = event.target.value as string;
              setTimeout(() => setUrl(value), 1000);
            }}
          />
        </div>}

        <span className="font-bold mt-4">Room Id: {roomNumber}</span>
        <div
          className="flex w-full flex-1 items-center justify-center"
        >
          <video
            ref={sourceRef}
            className="h-4/5 w-3/5 rounded-md border-2 border-black"
            controls
            controlsList="download"
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

        {/* <div className="absolute top-0 right-0 z-10 h-screen w-72 min-w-max bg-black text-white">
          <div className="space-between flex flex-col space-y-2">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span>Room Number: {roomNumber}</span>
              <span>Current Time: {currentTime}</span>
              <span>Is Paused: {isPaused ? "true" : "false"}</span>
            </div>
            <div className="flex flex-col items-start justify-start space-y-2 p-2">
              <span>Host Messages:</span>
              {hostMessages.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
              <div className="flex ">
                <span>Guest Messages:</span>
                {guestMessages.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );
}

export default Test;
