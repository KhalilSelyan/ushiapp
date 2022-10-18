import Gun from "gun";

const gun = Gun(
  process.env.NODE_ENV === "production"
    ? "https://gun-server.herokuapp.com/gun"
    : "http://localhost:3000/api/gun"
);

const jeff = gun.get("jeff");

jeff.put({
  name: "Jeff",
  age: 30,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
jeff.on((data, _key) => {
  console.log(data);
});
