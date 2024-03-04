import Sidebar from "../components/Sidebar"
import Tweet from "../components/Tweet";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


const server = process.env.REACT_APP_NODE_SERVER;

function Channel() {

    const navigate = useNavigate();

    const location = useLocation();

    const [limit, setLimit] = useState(15);
    const [skip, setSkip] = useState(0);
    const [data, setData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [nomeCanale, setNomeCanale] = useState("");
    const [iscritti, setIscritti] = useState([]);
    const [proprietari, setProprietari] = useState([]);
    const [canale, setCanale] = useState({});
    const [ilPiuAttivo, setIlPiuAttivo] = useState({});


    useEffect(() => {
        setNomeCanale(location.state.nomeCanale);
        fetchChannelInfo();
        fetchChannelPosts();
        piuAttivo();
    },[]);


    const updateProfile = () => {
        window.location.reload();
    }


    const piuAttivo = async() => {
        const dati = await fetch(server+"channels/"+location.state.nomeCanale+"/active", {
            method:"GET",
            headers: {
                "x-auth-token":sessionStorage.getItem("token")
            }
        })
        if (dati.status==200) {
            if(Object.keys(dati).length){
                const datiJSON = await dati.json();
                setIlPiuAttivo(datiJSON);
            }
        }
    }


    const fetchChannelInfo = async() => {
        console.log(nomeCanale);
        const dati = await fetch(server+"channels/"+location.state.nomeCanale, {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            const datiJSON = await dati.json();
            console.log(datiJSON);
            setCanale(datiJSON);
            setProprietari(datiJSON.proprietari);
            setIscritti(datiJSON.iscritti);
        }    
    }

    const fetchChannelPosts = async() => {
        const res = await fetch(server+"channels/"+ location.state.nomeCanale +"/squeals?skip="+skip+"&limit="+limit, {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        const resJSON = await res.json();  
        if (resJSON.length>0) {
            setData(data.concat(resJSON));
            setSkip(skip+limit);
        } else {
            setHasMore(false);
        }
    }


    const iscriviti = async() => {
        const dati = await fetch(server+"channels/"+location.state.nomeCanale+"/iscritti", {
            method: "POST",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            setIscritti(iscritti.concat(sessionStorage.getItem("user")));
        }
    }

    const annullaIscrizione = async() => {
        console.log(location.state.nomeCanale);
        const dati = await fetch(server+"channels/"+ location.state.nomeCanale+"/iscritti", {
            method: "DELETE",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            setIscritti(iscritti.filter((item) => {return item!=sessionStorage.getItem("user")}));
        }
    }


    if (sessionStorage.getItem("token")) {
        return (
            <div className="universe">
            <Sidebar></Sidebar>
            <div className="feed">
                <div className="feed__header">
                    <h2>Canale</h2>
                </div>
                <div className="profile__info">
                    <div className="profile__info__avatar">
                        <img src={"avatar0.png"}></img>
                    </div>
                    <div className="profile__info__info">
                        <h2>{nomeCanale}</h2>
                        <p>{canale.descrizione}</p>
                        <div className="proprietari">
                            <b>Proprietari: </b>
                            {proprietari.map((item,index) => {
                                if (proprietari.indexOf(item)==proprietari.length-1) {
                                return <p key={index}>{item}</p>
                                } else {
                                    return <p key={index}>{item},</p>
                                }
                            })}
                        </div>
                    </div>
                    <div>
                        {proprietari.includes(sessionStorage.getItem("user")) ?
                        <button onClick={() => navigate("/creacanale")} className="create__channel">Modifica le informazione del canale</button>
                        : (iscritti.includes(sessionStorage.getItem("user")) ?
                        <button className="create__channel" onClick={annullaIscrizione}>annula iscrizione</button>
                        :
                        <button className="create__channel" onClick={iscriviti}>ISCRIVITI</button>
                        )
                        }
                    </div>
                </div>
                    <InfiniteScroll
                        dataLength={data.length}
                        next={fetchChannelPosts}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}
                        >
                        {data.map((item) => {
                            return (
                                <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                    <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                    comments={item.commenti} update={updateProfile} nomeImmagine={item.nomeImmagine} data={item.data}
                                    destinatari={item.destinatari} proprietariCanale={proprietari}/>
                                </div>
                            );
                        })}
                    </InfiniteScroll>
            </div>
                <div className="feedRSS">
                    {iscritti.length>0 &&
                    <div className="gestione__canali">
                        <h3>ISCRITTI AL CANALE</h3>
                        {iscritti.map((item,index) => {
                            return (
                            <div key={index} className="canale__gestito">
                                <button><h5>{item}</h5></button>
                            </div>  
                            )
                        })}
                    </div>}
                    {ilPiuAttivo && <div className="gestione__canali">
                                        <div className="canale__gestito">
                                            <h5>{ilPiuAttivo.nome}</h5>
                                        </div>  
                                    </div>}
                </div>
        </div>
        )
    } else {
        return <Navigate replace to="/home" />;
    }

}

export default Channel;