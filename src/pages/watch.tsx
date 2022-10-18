import React from "react";

function Test() {
  const [url, setUrl] = React.useState([
    "https://sto032.akamai-cdn-content.com/tysxfsutho66j6cdadtrlwcdf6k4y7kw6l6ih566opplyhh4rhm72phqtacq/video.mp4",
  ]);

  const sourceRef = React.useRef<HTMLVideoElement>(null);

  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    console.log(currentTime);
  }, [currentTime]);

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
