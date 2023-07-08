import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login"
import Home from "./pages/Home"
import { useState } from "react";
import PaginaRegistrazione from "./pages/PaginaRegistrazione";


const server = "http://192.168.1.54:8099/";


function App() {
  return (
    <>
      <Routes>
        <Route path="/registrazione" element={<PaginaRegistrazione />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
