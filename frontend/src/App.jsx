import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  function handleClick() {
    fetch("http://localhost:8000/", (req, res) => {
      console.log(res);
    });
  }

  return (
    <>
      <button onClick={handleClick}>Check</button>
    </>
  );
}

export default App;
