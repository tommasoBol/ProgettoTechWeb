import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const server = process.env.REACT_APP_NODE_SERVER;

const UserList = () => {
  // Const per memorizzare i dati degli utenti, le opzioni di filtro e la query di ricerca
  const [users, setUsers] = useState([]);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [showOnlyModerators, setShowOnlyModerators] = useState(false);
  const [showOnlyPopularUsers, setShowOnlyPopularUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Effetto per filtrare gli utenti in base alle opzioni di filtro
    fetchUsers();
  }, [reverseOrder, showOnlyModerators, showOnlyPopularUsers, searchQuery]);

  const fetchUsers = async () => {
    try {
      // Effettua una richiesta GET per ottenere la lista degli utenti
      const response = await axios.get(server+'api/users');
      
      // Ordina gli utenti in base all'opzione di ordinamento
      let sortedUsers = response.data.sort((a, b) => {
        if (reverseOrder) {
          return b.username.localeCompare(a.username);
        } else {
          return a.username.localeCompare(b.username);
        }
      });

      // Filtra gli utenti in base all'opzione "Mostra solo moderatori"
      if (showOnlyModerators) {
        sortedUsers = sortedUsers.filter(user => user.isMod);
      }

      // Effettua una richiesta GET per ottenere i post e identifica gli utenti popolari
      const responsePosts = await axios.get(server+'api/posts');
      const popularUsernames = responsePosts.data
        .filter(post => post.categoria === "popolare")
        .map(post => post.autore);

      // Filtra gli utenti in base all'opzione "Mostra solo utenti popolari"
      if (showOnlyPopularUsers) {
        sortedUsers = sortedUsers.filter(user => popularUsernames.includes(user.username));
      }

      // Filtra gli utenti in base alla query di ricerca
      if (searchQuery) {
        sortedUsers = sortedUsers.filter(user =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Imposta l'elenco degli utenti filtrato nello stato
      setUsers(sortedUsers);
    } catch (error) {
      console.error(error);
    }
  };

  // Gestori degli eventi per le opzioni di filtro
  const handleReverseOrder = () => {
    setReverseOrder(!reverseOrder);
  };

  const handleShowOnlyModerators = () => {
    setShowOnlyModerators(!showOnlyModerators);
  };

  const handleShowOnlyPopularUsers = () => {
    setShowOnlyPopularUsers(!showOnlyPopularUsers);
  };

  // Gestore dell'input per la query di ricerca
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      {/* Titolo */}
      <h2 style={{ textAlign: 'center', backgroundColor: '#d8c8e3', color: 'white', padding: '10px' }}>Elenco utenti:</h2>
      {/* Sezione di filtro */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button style={{ maxWidth: '150px' }} onClick={handleReverseOrder}>Inverti ordine</button>
        <label style={{ marginBottom: '0' }}>
          <input
            type="checkbox"
            checked={showOnlyModerators}
            onChange={handleShowOnlyModerators}
          />
          Mostra solo moderatori
        </label>
        <label style={{ marginBottom: '0' }}>
          <input
            type="checkbox"
            checked={showOnlyPopularUsers}
            onChange={handleShowOnlyPopularUsers}
          />
          Mostra solo utenti popolari
        </label>
        <input
          type="text"
          placeholder="Cerca utente..."
          onChange={handleSearchChange}
          value={searchQuery}
          style={{ maxWidth: '150px' }}
        />
      </div>
      {/* Elenco degli utenti */}
      {users.map((user) => (
        <p key={user.username}>
          <Link to={`/user/${user.username}`}>{user.username}</Link>
        </p>
      ))}
    </div>
  );
};

export default UserList;
