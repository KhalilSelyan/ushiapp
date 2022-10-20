import React, { useEffect } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

function Test() {
  const [url, setUrl] = React.useState([""]);

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
  const [roomNumber, setRoomNumber] = React.useState(0);

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

  React.useEffect(() => {
    if (socket) {
      type === "host"
        ? socket.emit("host", {
            currentTime: currentTime,
            isPaused: isPaused,
            roomNumber: roomNumber,
          })
        : socket.on("watcher", (data) => {
            console.log("watcher", data);
            if (data.roomNumber === roomNumber) {
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
  }, [currentTime, isPaused]);

  if (!type && roomNumber === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center space-x-2 bg-sky-400">
        <span>Input room Number: </span>
        {/* Input room number */}
        <input
          type="text"
          className="rounded-md border-2 border-black p-2"
          onChange={(e) => {
            setTimeout(() => {
              setRoomNumber(Number(e.target.value));
            }, 2000);
          }}
        />
      </div>
    );
  }

  if (!type && roomNumber !== 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-x-2">
        <button onClick={() => setType("host")}>Host</button>
        <button onClick={() => setType("guest")}>Guest</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center overflow-scroll bg-blue-200 p-4">
      {/* input for user to enter the url */}
      <div className="flex w-full items-center justify-center space-x-2">
        <span>Url:</span>
        <input
          type="text"
          className="h-10 w-1/2 border-2 border-black"
          onChange={(event) => {
            // wait for user to finish typing
            const value = event.target.value as string;
            setTimeout(() => setUrl([...url, value]), 1000);
          }}
        />
      </div>

      {/* video player only render the last added url*/}
      {url.map(
        (item, index) =>
          url.length - 1 === index && (
            <div
              key={index}
              className="flex w-full flex-1 items-center justify-center"
            >
              <video
                key={index}
                ref={sourceRef}
                className="h-4/5 w-3/5 rounded-md border-2 border-black"
                controls
                controlsList="download"
                autoPlay
                onCanPlay={() => {
                  // get the video element
                  const video = sourceRef.current;
                  // get the video duration
                  const duration = video?.duration;

                  console.log(duration);

                  // get the video current time
                  setInterval(() => {
                    setCurrentTime(sourceRef.current?.currentTime as number);
                  }, 500);
                }}
              >
                <source src={item} type="video/mp4" />
              </video>
            </div>
          )
      )}
      <div className="absolute top-0 right-0 z-10 h-screen w-72 min-w-max bg-black text-white">
        <div className="flex flex-col  space-y-2">
          <div className="flex flex-col items-center justify-center space-y-2">
            <span>Room Number: {roomNumber}</span>
            <span>Current Time: {currentTime}</span>
            <span>Is Paused: {isPaused ? "true" : "false"}</span>
          </div>
          <div className="flex flex-col items-start justify-start space-y-2 p-2"></div>
        </div>
      </div>
    </div>
  );
}

export default Test;
