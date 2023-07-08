import { useState } from "react";
import "../style/Home.css"

const server = "http://192.168.1.54:8099/";

function Tweet(props) {

    const giorno = props.data[8]+props.data[9];
    const mese = props.data[5]+props.data[6];
    const ora = props.data[11]+props.data[12];
    const minuti = props.data[14]+props.data[15];
    const rndmimg = Math.floor((Math.random()*10));
    const [posR, setPosR] = useState(props.rPos);
    const [negR, setNegR] = useState(props.rNeg);
    const [areCommentsVisible, setCommentsVisible] = useState(false);
    const [commento, setCommento] = useState("");

    async function likePost() {
        const dati = await fetch(server+"like", {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
              },
            body: JSON.stringify({idSqueal: props.id, username: sessionStorage.getItem("user")})
        });
        const datiJSON = await dati.json();
        console.log(datiJSON);
        if (dati.status==200) {
            if (datiJSON.waslike==true) {
                setPosR(posR-1);
            } else {
                setPosR(posR+1);
            }
            if (datiJSON.wasdislike==true) {
                setNegR(negR-1);
            }
        }
    }

    async function dislikePost() {
        const dati = await fetch(server+"dislike", {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
              },
            body: JSON.stringify({idSqueal: props.id, username: sessionStorage.getItem("user")})
        });
        const datiJSON = await dati.json();
        console.log(datiJSON);
        if (dati.status==200) {
            if (datiJSON.wasdislike==true) {
                setNegR(negR-1);
            } else {
                setNegR(negR+1);
            }
            if (datiJSON.waslike==true) {
                setPosR(posR-1);
            }
        }
    }


    async function visualized() {
        const dati = await fetch(server+"visualized", {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
              },
            body: JSON.stringify({idSqueal: props.id, idUser: sessionStorage.getItem("user")})
        });
        const datiJSON = await dati.json();
        console.log(datiJSON);
        console.log(props.nomeImmagine);
    }


    const commenta = async() => {
        const data = new Date();
        if (commento.length>0) {
            const dati = await fetch(server+"commenta", {
                method:"POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({idSqueal: props.id, idUser: sessionStorage.getItem("user"), commento:commento, data:data})
            });
            const datiJSON = await dati.json();
            setCommento(datiJSON.message);
            if (dati.status==200) {
                setTimeout(()=>{props.update();setCommento("")}, 2000);
            }
        } else {
            alert("Commento vuoto");
            return;
        }

    }

    return (
        <>
            <div style={{display:"flex", flexDirection:"column"}}>
                <div className="post" onMouseEnter={visualized}>
                    <div className="post__avatar">
                        <img src={"avatar0.png"}></img>
                    </div>
                
                    <div className="post__body">
                        <div className="post__header">
                            <div className="post__headerText">
                                <h3>{props.autore}</h3>
                                <label style={{fontSize:"12px"}}>{giorno+"/"+mese+" alle "+ora+":"+minuti}</label>
                                {/*<h3>{props.id}</h3>*/}
                            </div>
                        </div>
                        <div className="post__corpo">
                            {props.nomeImmagine.length>0 ?
                            <img src={server+"files/"+props.nomeImmagine} ></img>
                            :
                            <p>{props.corpo}</p>
                            }
                        </div>
                        <div className="post__footer">
                            <div>
                                <button className="reaction-btn" onClick={likePost}><span className="material-icons"> mood </span></button>
                                <h4>{posR}</h4>
                            </div>
                            <div>
                                <button onClick={dislikePost} className="reaction-btn"><span className="material-icons"> mood_bad </span></button>
                                <h4>{negR}</h4>
                            </div>
                            <div>
                                <button onClick={()=> setCommentsVisible(!areCommentsVisible)} className="reaction-btn"><span className="material-icons"> comment </span></button>
                                <h4>{props.comments.length}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                {(areCommentsVisible) &&
                    <div className="comment-section">

                        {props.comments.map((item, index) => {
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
                                        <h3>{item.autore}</h3>
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
                                    <button onClick={commenta} style={{backgroundColor:"rgb(223, 223, 223)"}}><span className="material-symbols-outlined"> forward </span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
}

export default Tweet;