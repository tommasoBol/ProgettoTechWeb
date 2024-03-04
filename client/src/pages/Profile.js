import Sidebar from "../components/Sidebar";
import Tweet from "../components/Tweet";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../style/Profilo.css";


const server = process.env.REACT_APP_NODE_SERVER;

function Profile() {

    const navigate = useNavigate();

    const [limit, setLimit] = useState(15);
    const [skip, setSkip] = useState(0);
    const [data, setData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [username, setUsername] = useState();
    const [iscrizioni, setIscrizioni] = useState([]);
    const [quota, setQuota] = useState();

    const [canaliUtente, setCanaliUtente] = useState([]);

    useEffect(() => {
        fetchUserInfo();
        fetchUserPosts();
        fetchUserChannels();
    },[]);


    const updateProfile = () => {
        window.location.reload();
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
            setUsername(datiJSON.username);
            setIscrizioni(datiJSON.iscrizioni);
            setQuota(datiJSON.quotaCaratteri);
        }
    }

    const fetchUserPosts = async() => {
        const usrnm = sessionStorage.getItem("user");
        const res = await fetch(server+"profile-squeals?skip="+skip+"&limit="+limit, {
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
        console.log(skip);
        console.log(resJSON);
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
            <div className="universe">
            <Sidebar></Sidebar>
            <div className="feed">
                <div className="feed__header">
                    <h2>Profile</h2>
                    <button onClick={() => navigate("/cambiopassword")}>Cambio password</button>
                </div>
                <div className="profile__info">
                    <div className="profile__info__avatar">
                        <img src={"avatar0.png"}></img>
                    </div>
                    <div className="profile__info__info">
                        <h2>{username}</h2>
                        <p>Caratteri rimanenti questo mese : {quota}</p>
                    </div>
                    <div>
                        <button onClick={() => navigate("/creacanale")} className="create__channel">Crea il tuo canale</button>
                    </div>
                </div>
                    <InfiniteScroll
                        dataLength={data.length}
                        next={fetchUserPosts}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}
                        >
                        {data.map((item) => {
                            return (
                                <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                    <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                    comments={item.commenti} update={updateProfile} nomeImmagine={item.nomeImmagine} data={item.data}
                                    destinatari={item.destinatari} proprietariCanale={[]} />
                                </div>
                            );
                        })}
                    </InfiniteScroll>
            </div>
                <div className="feedRSS">
                    {canaliUtente.length>0 &&
                    <div className="gestione__canali">
                        <h3>I TUOI CANALI</h3>
                        {canaliUtente.map((item, index) => {
                            return (
                                <div key={index} className="canale__gestito">
                                    <button onClick={() => goToChannel(item.nome)}><h5>{item.nome}</h5></button>
                                </div>
                            )
                        })}
                    </div>}
                    {iscrizioni.length>0 &&
                    <div className="gestione__canali">
                        <h3>LE TUE ISCRIZIONI</h3>
                        {iscrizioni.map((item,index) => {
                            return (
                            <div key={index} className="canale__gestito">
                                <button onClick={() => goToChannel(item)}><h5>{item}</h5></button>
                            </div>  
                            )
                        })}
                    </div>}
                </div>
        </div>
        )
    } else {
        return <Navigate replace to="/" />;
    }

}

export default Profile;