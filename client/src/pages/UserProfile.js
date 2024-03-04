import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const server = process.env.REACT_APP_NODE_SERVER;

const UserProfile = () => {
  // Ottieni il parametro "username" dalla URL utilizzando useParams().
  const { username } = useParams();

  // Stati per memorizzare i dati dell'utente e i dati dell'utente in fase di modifica.
  const [user, setUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    username: '', password: '', quotaCaratteri: 0, iscrizioni: [], bloccato: false,
  });

  useEffect(() => {
    // Effetto per caricare i dati dell'utente quando il parametro "username" cambia
    const fetchUser = async () => {
      try {
        // Effettua una richiesta GET per ottenere i dati dell'utente specifico
        const response = await axios.get(server+`api/users/${username}`);
        
        // Aggiorna lo stato con i dati dell'utente e i dati in fase di modifica
        setUser(response.data);
        setUpdatedUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // Chiama la funzione di caricamento quando cambia il parametro "username"
    fetchUser();
  }, [username]);

  // Gestore per le modifiche agli input del modulo
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Gestore per il cambiamento dello stato "bloccato"
  const handleBlockChange = () => {
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      bloccato: !prevUser.bloccato,
    }));
  };

  // Gestore per il salvataggio delle modifiche
  const saveChanges = async () => {
    try {
      // Effettua una richiesta PUT per salvare le modifiche dell'utente specifico
      await axios.put(server+`api/users/${username}`, updatedUser);
      
      // Aggiorna lo stato dell'utente con i dati modificati
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {user ? (
        <>
          {/* Titolo del profilo utente */}
          <h2 style={{ textAlign: 'center', backgroundColor: '#d8c8e3', color: 'white', padding: '10px' }}>
            Profilo utente:
          </h2>
          {/* Modulo di modifica */}
          <div>
            <label>Username:</label>
            <input type="text" name="username" value={updatedUser.username} onChange={handleInputChange} />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" value={updatedUser.password} onChange={handleInputChange} />
          </div>
          <div>
            <label>Quota Caratteri:</label>
            <input
              type="number"
              name="quotaCaratteri"
              value={updatedUser.quotaCaratteri}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Iscrizioni:</label>
            <input
              type="text"
              name="iscrizioni"
              value={updatedUser.iscrizioni.join(',')}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Utente Bloccato:</label>
            <input
              type="checkbox"
              name="bloccato"
              checked={updatedUser.bloccato}
              onChange={handleBlockChange}
            />
          </div>
          <button onClick={saveChanges}>Salva Modifiche</button>
        </>
      ) : (
        // Messaggio di caricamento se i dati dell'utente non sono ancora disponibili
        <p>Caricamento del profilo in corso...</p>
      )}
    </div>
  );
};

export default UserProfile;
