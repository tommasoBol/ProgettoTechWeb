import { useEffect, useState } from "react";

const server = process.env.REACT_APP_NODE_SERVER;

function Commenti(props) {

    const [commento, setCommento] = useState("");
    const [lista, setLista] = useState(props.lista);

    const updateComments = async() => {
        const dati = await fetch(server+"squeals/"+props.idSqueal+"/commenti", {
            method:"GET",
            headers: {
                "x-auth-token":sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            const datiJSON = await dati.json();
            console.log(datiJSON);
            setLista([...datiJSON]);
        }
    }


    const commenta = async() => {
        const data = new Date();
        if (commento.length>0) {
            const dati = await fetch(server+"squeals/"+props.idSqueal+"/commenti", {
                method:"POST",
                headers: {
                    "x-auth-token": sessionStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({commento:commento})
            });
            const datiJSON = await dati.json();
            if (dati.status==200) {
                setCommento(datiJSON);
                updateComments();
                setTimeout(()=> setCommento(""), 2000);
            }
        } else {
            alert("Commento vuoto");
            return;
        }

    }


    const deleteComment = async(idCommento) => {
        const dati = await fetch(server+"squeals/"+props.idSqueal+"/commenti/"+idCommento, {
            method:"DELETE",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        })
        if (dati.status==200) {
            updateComments();
        }
    }

    return (
        <div className="comment-section">

            {lista.map((item, index) => {
                const giorno = item.data[8]+item.data[9];
                const mese = item.data[5]+item.data[6];
                const ora = item.data[11]+item.data[12];
                const minuti = item.data[14]+item.data[15];
                return(
                    <div className="comment" key={index}>
                        <div className="comment__avatar">
                            <img src="avatar0.png"></img>
                        </div>
                        <div className="comment__body">
                            <div className="header__comment">
                                <h3>{item.autore}</h3>
                                {(item.autore==sessionStorage.getItem("user")||(props.proprietariCanale && props.proprietariCanale.includes(sessionStorage.getItem("user")))) &&
                                <button onClick={() => deleteComment(item.id)}><span className="material-symbols-outlined"> delete </span></button>}
                            </div>
                            <label style={{fontSize:"12px"}}>{giorno+"/"+mese+" alle "+ora+":"+minuti}</label>                           
                            <p>{item.messaggio}</p>
                        </div>
                        
                    </div>
                );
            })}
            <div className="comment__write">
                <div className="comment__avatar">
                    <img src={"avatar0.png"}></img>
                </div>
                <div className="comment__body">
                    <div>
                        <input type="text" placeholder="Scrivi un commento..." value={commento} onChange={(e)=>setCommento(e.target.value)}></input>
                    </div>
                    <div className="comment__send">
                        <button onClick={commenta}><span className="material-symbols-outlined"> forward </span></button>
                    </div>
                </div>
            </div>
        </div>
    );  
}

export default Commenti;