import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/Login.css";

const server = "http://192.168.1.54:8099/";

function Form() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function clearInputs() {
    setUsername("");
    setPassword("");
  }

  async function login(event) {
      event.preventDefault();
      const dati = await fetch(server+"login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({username: username, password:password})
      });
      const datiJSON = await dati.json();
      if (dati.status==200) {
        sessionStorage.setItem("autenticato", true);
        sessionStorage.setItem("user", datiJSON.username);
        navigate("/home");
      } else {
        alert("Username o password non validi");
        clearInputs();
      }
    }

  return (
    <>
        <form onSubmit={ login } className="login-form">
          <div className="form-control">
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} name="username" />
            <i className="fas fa-user"></i>
          </div>
          <div className="form-control">
            <input type="password"placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} name="psswd" />
            <i className="fas fa-lock"></i>
          </div>
          <input className="submit" type="submit" value="Log In" />
        </form>
    </>
  );
}

export default Form;