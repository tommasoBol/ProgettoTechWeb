import React, { useState } from 'react';
import axios from 'axios';
import "../style/Login.css";
import { useNavigate } from 'react-router-dom';
import { setBodyLogin, removeBodyHome } from "../utils";

const server = "http://192.168.1.54:8099/";

const PaginaRegistrazione = () => {
  const navigate = useNavigate();
  const [goodRegistration, setGoodRegistration] = useState("Registrati su Squealer");
  const [isDisabled, setDisabled] = useState(false);
  const [datiForm, setDatiForm] = useState({
    username: '',
    password: '',
    confermaPassword: ''
  });
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    removeBodyHome();
    setBodyLogin();
    setMounted(true);
    }

  const gestisciModificaInput = (evento) => {
    setDatiForm({
      ...datiForm,
      [evento.target.name]: evento.target.value
    });
  };


  const gestisciInvioModulo = async (evento) => {
    evento.preventDefault();

    if (datiForm.password!=datiForm.confermaPassword) {
        alert("I campi password e conferma password non coincidono");
        return;
    }

    try {
      const response = await axios.post(server+'registrazione', datiForm);
      setDisabled(true);
      setGoodRegistration("Registrazione avvenuta con successo. Verrai reindirizzato alla pagina di login...");
      setTimeout(() => navigate("/"), 3000);

    } catch (error) {
        if (error.response.status==400) {
            alert("Username già in uso");
        } else if (error.response.status==500) {
            alert("Errore del server");
        } else {
            alert("ERRORE");
        }
        return;
    }
  };

  return (
    <>
    <div className="container">
        <div className="logo">
            <img src="eagle.jpg"></img> 
        </div>
    </div>
    <main className="container">
        <h1>{goodRegistration}</h1>
        <div className="container">
            <div className="login">
                <form onSubmit={gestisciInvioModulo}>
                    <fieldset disabled={isDisabled}>
                        <div className="inputs">
                            <label className="usuario">Username:</label>
                            <input type="text" name="username" value={datiForm.username} onChange={gestisciModificaInput} />
                        </div>
                        <div className="inputs">
                            <label className="usuario">Password:</label>
                        <input type="password" name="password" value={datiForm.password} onChange={gestisciModificaInput} />
                        </div>
                        <div className="inputs">
                            <label className="usuario">Conferma Password:</label>
                            <input type="password" name="confermaPassword" value={datiForm.confermaPassword} onChange={gestisciModificaInput} />
                        </div>
                        <div>
                            <button className="button" type="submit">Registrati</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    </main>
    </>
  );
};

export default PaginaRegistrazione;
