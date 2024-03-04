import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/Login.css";
import "../components/FormRegistrazione";
import FormRegistrazione from '../components/FormRegistrazione';

const server = process.env.REACT_APP_NODE_SERVER;

const PaginaRegistrazione = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className='wrapper'>
        <section className="side">
          <img src="deadbird.png" alt="" />
        </section>
        <section className="mobile">
          <div id='mobile-box'>
            <img src="deadbird.png" alt="" />
          </div>
          <div id='mobile-box'>
            <button className="btn-register" onClick={() => {navigate("/")}}>ACCEDI</button>
          </div>
        </section>
        <section className='main'>
            <div className='submain'>
              <input className="submit" type="submit" value="ACCEDI" onClick={() => {navigate("/")}} />
              <input className="submit" type="submit" value="Accesso senza credenziali" onClick={() => navigate("/home")}/>
            </div>
            <div className='login-container'>
              <p className="title">Registrati in Squealer</p>
              <div className="separator"></div>
              <p className="welcome-message">Crea il tuo account e inizia a dire la tua</p>
              <FormRegistrazione></FormRegistrazione>
            </div>
        </section>
      </div>
    </>
)
};

export default PaginaRegistrazione;
