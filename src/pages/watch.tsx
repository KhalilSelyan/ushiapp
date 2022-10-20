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

  useEffect(() => {
    const ss:
      | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
      | any = io("https://ushi-back-production.up.railway.app/");
    setSocket(ss);
  }, []);

  React.useEffect(() => {
    console.log(currentTime);
    if (socket) {
      type === "host"
        ? socket.emit("host", currentTime)
        : socket.on("watcher", (data) => {
            console.log("Listener:", data);
            if (sourceRef.current) {
              sourceRef.current.currentTime = data;
            }
          });
    }
  }, [currentTime]);

  if (!type) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-x-2">
        <button onClick={() => setType("host")}>Host</button>
        <button onClick={() => setType("guest")}>Guest</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-evenly overflow-scroll bg-blue-200">
      {/* input for user to enter the url */}

      <input
        type="text"
        onChange={(event) => {
          // wait for user to finish typing
          const value = event.target.value as string;
          setTimeout(() => setUrl([...url, value]), 1000);
        }}
        className="h-10 w-1/2 border-2 border-black"
      />

      {/* video player only render the last added url*/}
      {url.map(
        (item, index) =>
          url.length - 1 === index && (
            <div key={index}>
              <video
                key={index}
                ref={sourceRef}
                className="h-[400px] w-[600px] rounded-md border-2 border-black"
                controls
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
                  }, 1000);
                }}
              >
                <source src={item} type="video/mp4" />
              </video>
            </div>
          )
      )}
    </div>
  );
}

export default Test;
