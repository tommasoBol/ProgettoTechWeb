import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/Login.css";


const server = process.env.REACT_APP_NODE_SERVER;

function Form() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function clearInputs() {
    setUsername("");
    setPassword("");
  }

  /*async function login(event) {
      event.preventDefault();
      console.log("server " + process.env.REACT_APP_NODE_SERVER);
      const dati = await fetch(process.env.REACT_APP_NODE_SERVER+"login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({username: username, password:password})
      });
      const datiJSON = await dati.json();
      if (dati.status==200) {
        sessionStorage.setItem("user", datiJSON.username);
        sessionStorage.setItem("token", datiJSON.token);
        console.log("token: " + datiJSON.token);
        navigate("/home");
      } else {
        alert("Username o password non validi");
        clearInputs();
      }
    }*/

    async function login(event) {
      event.preventDefault();
      console.log("server " + server);
      const dati = await fetch(server+"users?username="+username+"&password="+password, {
        method: "GET"
      });
      const datiJSON = await dati.json();
      if (dati.status==200) {
        if (!datiJSON.isMod) {
          sessionStorage.setItem("user", username);
          sessionStorage.setItem("token", datiJSON.token);
          navigate("/home");
        } else {
          navigate("/moderator");
        }
      } else if (dati.status==400) {
        alert("Username o password non validi");
        clearInputs();
      } else {
        alert("Account bloccato");
        clearInputs();
      }
    }

  return (
    <>
        <form onSubmit={ login } className="login-form">
          <div className="form-control">
            <input required type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} name="username" />
            {/*<i className="fas fa-user"></i>*/}
            <span className="material-symbols-outlined"> person </span>
          </div>
          <div className="form-control">
            <input required type="password"placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} name="psswd" />
            <span className="material-symbols-outlined"> vpn_key </span>
          </div>
          <input className="submit" type="submit" value="Log In" />
        </form>
    </>
  );
}

export default Form;