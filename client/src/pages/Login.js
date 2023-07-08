import '../style/Login.css';
import Form from './Form';
import { setBodyLogin, removeBodyHome} from '../utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const server = "http://192.168.1.54:8099/";

function Login() {
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
            <button className="btn-register" onClick={() => {navigate("/registrazione")}}>Registrati</button>
          </div>
        </section>
        <section className='main'>
            <div className='login-container'>
            <p className="title">Entra in Squealer</p>
            <div className="separator"></div>
            <p className="welcome-message">Inserisci username e password e inizia a dire la tua</p>
            <Form />
          </div>
        </section>
      </div>
    </>
)
}

export default Login;