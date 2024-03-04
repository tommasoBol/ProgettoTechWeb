import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "../style/PaginaIscrizioni.css";

const server = process.env.REACT_APP_NODE_SERVER;

function Iscrizioni() {

    const [iscrizioni, setIscrizioni] = useState([]);
    const [canaliUtente, setCanaliUtente] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserInfo();
        fetchUserChannels();
    },[]);

    const fetchUserInfo = async() => {
        const usrnm = sessionStorage.getItem("user");
        const dati = await fetch(server+"users/"+usrnm, {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            const datiJSON = await dati.json();
            console.log(datiJSON);
            setIscrizioni(datiJSON.iscrizioni);
        }
    }

    const fetchUserChannels = async() => {
        const usrnm = sessionStorage.getItem("user");
        const dati = await fetch(server+"channels?proprietario="+usrnm, {
            method:"GET",
            headers: {
                "x-auth-token":sessionStorage.getItem("token")
            }
        })
        const datiJSON = await dati.json();
        if (dati.status==200) {
            console.log("Canali utente");
            console.log(datiJSON);
            setCanaliUtente(datiJSON);
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

    if (sessionStorage.getItem("token")) {
        return (
            <div id="full">
                <span onClick={() => navigate("/home")} style={{margin:"1em"}}class="material-symbols-outlined">arrow_back</span>
            {iscrizioni.length>0 &&
                        <div className="canaloni">
                            <h3>LE TUE ISCRIZIONI</h3>
                            {iscrizioni.map((item,index) => {
                                return (
                                <div key={index} className="canale__gestito">
                                    <button onClick={() => goToChannel(item)}><h5>{item}</h5></button>
                                </div>  
                                )
                            })}
                        </div>}
            {canaliUtente.length>0 &&
                        <div className="canaloni">
                            <h3>I TUOI CANALI</h3>
                            {canaliUtente.map((item,index) => {
                                return (
                                    <div key={index} className="canale__gestito">
                                        <button onClick={() => goToChannel(item.nome)}><h5>{item.nome}</h5></button>
                                    </div>  
                                )
                            })}
                        </div>}
            </div>
        );
    } else {
        return <Navigate replace to="/" />;
    }
}

export default Iscrizioni;