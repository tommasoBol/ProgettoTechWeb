import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import '../style/Post.css';

const server = process.env.REACT_APP_NODE_SERVER;

const ModeratorHome = () => {
  // Const per immagazzinare dati dei post, utenti e canali.
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  
  // Const per i filtri
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [postRecipient, setPostRecipient] = useState({});
  
  // Effetti per caricare i dati dei post, utenti e canali all'avvio
  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchChannels();
  }, []);
  
  // Effetto per applicare i filtri ai post ogni volta che cambiano i dati dei post
  useEffect(() => {
    applyFilters();
  }, [posts, selectedAuthors, selectedRecipients, selectedChannels, sortOrder, startDate, endDate]);
  
  // Funzione per recuperare i dati dei post dal server
  const fetchPosts = async () => {
    try {
      const response = await axios.get(server+'api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Funzione per recuperare i dati degli utenti dal server
  const fetchUsers = async () => {
    try {
      const response = await axios.get(server+'api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Funzione per recuperare i dati dei canali dal server
  const fetchChannels = async () => {
    try {
      const response = await axios.get(server+'api/channels');
      setChannels(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Funzione per formattare dara e orario da far vedere nei post
  const formatDateTime = (dateTime) => {
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    };
    const date = new Date(dateTime);
    return date.toLocaleString(undefined, options);
  };
  
  // Funzione per gestire il cambio di autore selezionato nei filtri
  const handleAuthorChange = (e) => {
    const author = e.target.value;
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedAuthors([...selectedAuthors, author]);
    } else {
      setSelectedAuthors(selectedAuthors.filter((selectedAuthor) => selectedAuthor !== author));
    }
  };
  
  // Funzione per gestire il cambio di destinatario (utenti) selezionato nei filtri
  const handleRecipientChange = (e) => {
    const recipient = e.target.value;
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    } else {
      setSelectedRecipients(selectedRecipients.filter((selectedRecipient) => selectedRecipient !== recipient));
    }
  };
  
  // Funzione per gestire il cambio di destinatario (canale) selezionato nei filtri
  const handleChannelChange = (e) => {
    const channel = e.target.value;
    const isSelected = e.target.checked;
    if (isSelected) {
      setSelectedChannels([...selectedChannels, channel]);
    } else {
      setSelectedChannels(selectedChannels.filter((selectedChannel) => selectedChannel !== channel));
    }
  };
  
  // Funzione per invertire l'ordine di visualizzazione
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Funzione per gestire il cambio di data di inizio nei filtri
  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    setStartDate(startDate);
  };
  
  // Funzione per gestire il cambio di data di fine nei filtri
  const handleEndDateChange = (e) => {
    const endDate = e.target.value;
    setEndDate(endDate);
  };
  
  // Funzione per applicare i filtri al post
  const applyFilters = () => {
    const filtered = posts.filter((post) => {
      // Controlla se l'autore è selezionato o se non ci sono autori selezionati
      const isAuthorSelected = selectedAuthors.length === 0 || selectedAuthors.includes(post.autore);

      // Controlla se almeno uno dei destinatari è selezionato o se non ci sono destinatari selezionati (utenti).
      const isRecipientSelected = selectedRecipients.length === 0 || selectedRecipients.some((recipient) => post.destinatari.includes(recipient));

      // Controlla se almeno uno dei canali è selezionato o se non ci sono canali selezionati (canali).
      const isChannelRecipient = selectedChannels.length === 0 || post.destinatari.some(channel => selectedChannels.includes(channel));

      // Controlla se la data di creazione del post rientra nell'intervallo specificato.
      if (
        isAuthorSelected && isRecipientSelected && isChannelRecipient &&
        (startDate === '' || new Date(post.data) >= new Date(startDate)) &&
        (endDate === '' || new Date(post.data) <= new Date(endDate))
      ) {
        return true;
      }
      return false;
    });
    
    // Ordina i post in base all'ordine specificato
    const sorted = sortOrder === 'asc' ? filtered : filtered.reverse();
    setFilteredPosts(sorted);
  };
  
  // Funzione per gestire la cancellazione di un post
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(server+`api/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };
  
  // Funzione per gestire il cambio di destinatario di un post
  const handlePostRecipientChange = (postId, recipient) => {
    const selectedRecipients = recipient.map(r => r.value);
  
    setPostRecipient({ ...postRecipient, [postId]: selectedRecipients });
  
    axios.put(server+`api/posts/${postId}/destinatari`, { destinatari: selectedRecipients })
      .then(response => {
        fetchPosts();
      })
      .catch(error => {
        console.error(error);
      });
  };
  
  return (
    <div>
      <h2 style={{ textAlign: 'center', backgroundColor: '#d8c8e3', color: 'white', padding: '10px' }}>Squealer Moderator</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>Filtri per autore</h3>
          {users.map((user) => (
            <div key={user.username}>
              <input
                type="checkbox"
                id={user.username}
                value={user.username}
                checked={selectedAuthors.includes(user.username)}
                onChange={handleAuthorChange}
              />
              <label htmlFor={user.username}>{user.username}</label>
            </div>
          ))}
        </div>
        <div>
          <h3>Filtri per destinatario (utenti)</h3>
          {users.map((user) => (
            <div key={user.username}>
              <input
                type="checkbox"
                id={user.username}
                value={user.username}
                checked={selectedRecipients.includes(user.username)}
                onChange={handleRecipientChange}
              />
              <label htmlFor={user.username}>{user.username}</label>
            </div>
          ))}
        </div>
        <div>
          <h3>Filtri per destinatario (canali)</h3>
          {channels.map((channel) => (
            <div key={channel.nome}>
              <input
                type="checkbox"
                id={channel.nome}
                value={channel.nome}
                checked={selectedChannels.includes(channel.nome)}
                onChange={handleChannelChange}
              />
              <label htmlFor={channel.nome}>{channel.nome}</label>
            </div>
          ))}
        </div>
        <div>
          <h3>Filtri per data</h3>
          <label>Da:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
          <label>A:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
        <button onClick={toggleSortOrder}>Inverti ordine</button>
        <button>
          <Link to="/users">Visualizza elenco utenti</Link>
        </button>
      </div>
      {filteredPosts.map((post) => (
        <div key={post.id} style={{ marginTop: '20px', marginBottom: '20px', border: 'solid', borderColor: '#80bbd6df', maxWidth: '75%', margin: '0 auto', borderRadius: '5px', padding:'1px' }}>
              <div style={{ marginLeft: '5px', marginBottom: '10px', padding: '5px', borderBottom: '1px solid gray' }}>
                <p style={{ textAlign: 'left', fontSize: '12px', color: 'gray', margin: '0' }}>{formatDateTime(post.data)}</p>
                <p style={{ textAlign: 'left', fontSize: '12px', color: 'gray', margin: '0' }}>Categoria: {post.categoria}</p>
              </div>
          <div key={post.id} style={{display:"flex", flexDirection:"column"}}>
            <div className="post">
              <div className="post__body">
                <div className="post__header">
                  <div className="post__headerText">
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                      <div style={{display:"flex", flexWrap:"nowrap"}}>
                        <h3>
                          <Link to={`/user/${post.autore}`}>{post.autore} </Link> {"--->"}{' '}
                          {post.destinatari.map((destinatario, index) => (
                            <span key={destinatario}>
                              {index > 0 && ', '}
                              {destinatario}
                            </span>
                          ))}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <label htmlFor="destinatario">Cambia destinatario:</label>
                  <Select
                    options={[...users, ...channels].map(item => ({ value: item.username || item.nome, label: item.username || item.nome }))}
                    isMulti
                    value={postRecipient[post.id] ? postRecipient[post.id].map(r => ({ value: r, label: r })) : []}
                    onChange={(recipient) => handlePostRecipientChange(post.id, recipient)}
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        width: "30%",
                        borderRadius: "1px",
                        border: "solid",
                        backgroundImage: "linear-gradient(to right, #d8c8e3, #80bbd6df)",
                      }),
                      option: (baseStyles) => ({
                        ...baseStyles,
                        borderRadius: "1px",
                        "&:hover": { backgroundColor: "grey" },
                        backgroundImage: "linear-gradient(to right, #d8c8e3, #80bbd6df)",
                        fontStyle: "italic",
                      }),
                    }}
                  />
                  <div className="post__corpo">
                    {post.nomeImmagine.length > 0 ? (
                      <img src={`http://localhost:8000/files/${post.nomeImmagine}`} alt="Immagine" />
                    ) : (
                      <p>{post.corpo}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: '5px', padding: '5px'}}>
              <p style={{ textAlign: 'left', fontSize: '12px', color: 'gray', margin:'0'}}>Visualizzato da: {post.visualizzazioni.join(', ')}</p>
              <p style={{ textAlign: 'left', fontSize: '12px', color: 'gray', margin:'0'}}>Reazioni Positive: {post.rPos.join(', ')}</p>
              <p style={{ textAlign: 'left', fontSize: '12px', color: 'gray', margin:'0'}}>Reazioni Negative: {post.rNeg.join(', ')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModeratorHome;
