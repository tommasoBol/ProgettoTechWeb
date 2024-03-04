import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/Login.css";


const server = process.env.REACT_APP_NODE_SERVER;

function FormRegistrazione() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");

  function clearInputs() {
    setUsername("");
    setPassword("");
    setSecondPassword("");
  }

    async function register(event) {
      event.preventDefault();
      if (password!=secondPassword) {
        alert("Errore nella password");
        return;
      }
      const dati = await fetch(server+"users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username:username, password:password})
      });
      const datiJSON = await dati.json();
      if (dati.status==201) {
        sessionStorage.setItem("user", username);
        sessionStorage.setItem("token", datiJSON.token);
        navigate("/home");
      } else if (dati.status==409) {
        alert("Username già in uso");
        clearInputs();
      } else {
        alert("ERRORE");
      }
    }

  return (
    <>
        <form onSubmit={ register } className="login-form">
          <div className="form-control">
            <input required type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} name="username" />
            <span className="material-symbols-outlined"> person </span>
          </div>
          <div className="form-control">
            <input required type="password"placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} name="psswd" />
            <span className="material-symbols-outlined"> vpn_key </span>
          </div>
          <div className="form-control">
            <input required type="password"placeholder="Ripeti la password" onChange={(e) => setSecondPassword(e.target.value)} value={secondPassword} name="psswd2" />
            <span className="material-symbols-outlined"> vpn_key </span>
          </div>
          <input className="submit" type="submit" value="Registrati" />
        </form>
    </>
  );
}

export default FormRegistrazione;