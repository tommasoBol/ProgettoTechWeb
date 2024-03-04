import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login"
import Home from "./pages/Home"
import Profile from "./pages/Profile";
import PaginaRegistrazione from "./pages/PaginaRegistrazione";
import CreaCanale from "./pages/CreaCanale";
import Channel from "./pages/Channel";
import CambioPassword from "./pages/CambioPassword";
import ModeratorHome from "./pages/ModeratorHome";
import UserList from "./pages/UserList";
import UserProfile from "./pages/UserProfile";
import Iscrizioni from "./pages/Iscrizioni";


function App() {
  return (
    <>
      <Routes>
        <Route path="/registrazione" element={<PaginaRegistrazione />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/creacanale" element={<CreaCanale />} />
        <Route path="/channel" element={<Channel />} />
        <Route path="/cambiopassword" element={<CambioPassword />} />
        <Route path="/subscriptions" element={<Iscrizioni />} />
        <Route path="/moderator" element={<ModeratorHome />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/users" element={<UserList />} />
      </Routes>
    </>
  );
}

export default App;
