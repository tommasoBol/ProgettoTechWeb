import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css"
import Commenti from "./Commenti";

const server = process.env.REACT_APP_NODE_SERVER;

function Tweet(props) {

    const navigate = useNavigate();
    const giorno = props.data[8]+props.data[9];
    const mese = props.data[5]+props.data[6];
    const ora = props.data[11]+props.data[12];
    const minuti = props.data[14]+props.data[15];
    const [posR, setPosR] = useState(props.rPos);
    const [negR, setNegR] = useState(props.rNeg);
    const [areCommentsVisible, setCommentsVisible] = useState(false);
    const [privacyIcon, setPrivacyIcon] = useState("");
    const [privacyTitle, setPrivacyTitle] = useState("");
    const [stringaDestinatari, setStringaDestinatari] = useState("");


    useEffect(() => {
        if (props.destinatari.indexOf("TUTTI")>=0) {
            setPrivacyIcon("public");
            setPrivacyTitle("un messaggio alla folla...");
        } else if (props.destinatari[0][0]!=='§') {
            setPrivacyIcon("person");
            setPrivacyTitle("un messaggio privato...");
        } else {
            setPrivacyIcon("group");
            setPrivacyTitle("un messaggio agli slime");
        } 
        let index = 0;
        let stringa = "";
        for (index in props.destinatari) {
            if (index!=props.destinatari.length-1) {
            stringa = stringa + props.destinatari[index] + " & ";
            } else {
                stringa = stringa + props.destinatari[index];
            }
        }
        setStringaDestinatari(stringa);
    }, []);

  

    async function likePost() {
        const dati = await fetch(server+"squeals/"+props.id+"/rPos", {
            method:"POST",
            headers: {
                "x-auth-token": sessionStorage.getItem("token"),
            }
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
        const dati = await fetch(server+"squeals/"+props.id+"/rNeg", {
            method:"POST",
            headers: {
                "x-auth-token": sessionStorage.getItem("token"),
              }
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
        const dati = await fetch(server+"squeals/"+props.id+"/visualizzazioni", {
            method:"POST",
            headers: {
                "x-auth-token": sessionStorage.getItem("token"),
              }
        });
        const datiJSON = await dati.json();
        console.log(datiJSON);
    }


    const deletePost = async() => {
        const dati = await fetch(server+"squeals/"+props.id, {
            method:"DELETE",
            headers: {
                "x-auth-token": sessionStorage.getItem("token"),
            },
        });
        const datiJSON = await dati.json();
        if (dati.status==200) {
            alert(datiJSON);
            props.update();
        } else if (dati.status==400) {
            alert(datiJSON);
        }
    }


    const goToChannel = (nomeCanale) => {
        console.log(nomeCanale);
        navigate("/channel", {
            state: {
                nomeCanale:nomeCanale
            }
        })
    }



    return (
        <>
            <div style={{display:"flex", flexDirection:"column"}}>
                {/*<div className="post" onMouseEnter={visualized}>*/}
                <div className="post">
                    <div className="post__avatar">
                        <img src={"avatar0.png"}></img>
                    </div>
                
                    <div className="post__body">
                        <div className="post__header">
                            <div className="post__headerText">
                                <div style={{display:"flex", justifyContent:"space-between"}}>
                                    <div style={{display:"flex", flexWrap:"nowrap"}}>
                                    <h3>{props.autore} {"--->"} {props.destinatari[0][0]=="§" ? <button className="link__canale" onClick={() => goToChannel(props.destinatari)}>{props.destinatari}</button> : <>{stringaDestinatari}</>}</h3>
                                    </div>
                                    {((props.autore==sessionStorage.getItem("user"))||(props.proprietariCanale.includes(sessionStorage.getItem("user")))) && 
                                    <button onClick={deletePost}><span className="material-symbols-outlined"> delete </span></button>}
                                </div>
                                <div className="post__date__privacy">
                                    <label style={{fontSize:"12px", paddingRight:"5px"}}>{giorno+"/"+mese+" alle "+ora+":"+minuti}</label>
                                    <span className="material-symbols-outlined" title={privacyTitle}> {privacyIcon} </span>
                                </div>
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
                                <button className="reaction-btn" onClick={likePost}><span className="material-symbols-outlined"> sentiment_very_satisfied </span></button>
                                <h4>{posR}</h4>
                            </div>
                            <div>
                                <button onClick={dislikePost} className="reaction-btn"><span className="material-symbols-outlined"> mood_bad </span></button>
                                <h4>{negR}</h4>
                            </div>
                            <div>
                                <button onClick={()=> setCommentsVisible(!areCommentsVisible)} className="reaction-btn"><span className="material-symbols-outlined"> comment </span></button>
                                <h4>{props.comments.length}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                {(areCommentsVisible) &&

                    <Commenti lista={props.comments} idSqueal={props.id} update={props.update} proprietariCanale={props.proprietariCanale}/>

                    /*<div className="comment-section">

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
                    </div>*/
                }
            </div>
        </>
    );
}

export default Tweet;