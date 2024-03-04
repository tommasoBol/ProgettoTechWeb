import { useEffect, useState } from "react";
import { Form, Navigate, useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import "../style/Home.css";
import "../style/Login.css";
import "../style/Sidebar.css";
import "../style/Tweetbox.css";
import "../style/Post.css";
import "../style/Commenti.css";
import Sidebar from "../components/Sidebar";
import Tweet from "../components/Tweet";
import Option from "../components/Option";
import FormTweet from "../components/FormTweet";

import { default as ReactSelect } from "react-select";


const server = process.env.REACT_APP_NODE_SERVER;


function Home() {
    const navigate = useNavigate();
    const [limit, setLimit] = useState(15);
    const [skip, setSkip] = useState(0);
    const [data, setData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [query, setQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [canaliPerNome, setCanaliPerNome] = useState([]);


    const updateHome = () => {
        window.location.reload();
    }    

    useEffect(() => {
        fetchPosts2(skip);
    } , []);

    useEffect(() => {
        filtraPost();
        cercaCanaliPerNome();
    }, [query])



    const fetchPosts2 = async(skipToSet) => {
        const newSkip = skipToSet;
        const usrnm = sessionStorage.getItem("user");
        console.log(usrnm);
        const res = await fetch(process.env.REACT_APP_NODE_SERVER+"squeals?skip="+newSkip+"&limit="+limit, {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        const resJSON = await res.json();  
        if (resJSON.length>0) {
            setData(data.concat(resJSON));
            setSkip(newSkip+limit);
        } else {
            setHasMore(false);
        }
        console.log(skip);
        console.log(resJSON);
    }

    const fetchPosts3 = async(skipToSet) => {
        const newSkip = skipToSet;
        const res = await fetch(process.env.REACT_APP_NODE_SERVER+"squeals?skip="+newSkip+"&limit="+limit, {
            method:"GET",
        });
        const resJSON = await res.json();  
        if (resJSON.length>0) {
            setData(resJSON);
            setSkip(limit);
        } else {
            setHasMore(false);
        }
        console.log(skip);
        console.log("Ne abbiamo? : " + hasMore);
        console.log(resJSON);
    }


    const handleSearchChange = (e) => {
        setQuery(e.target.value);
    };

    const filtraPost = () => {
        setFilteredData([]);
        let index = 0;
        const filtrati = data.filter((item) => item.corpo.includes(query) || item.destinatari.includes(query));
        setFilteredData(filtrati);
    }

    const cercaCanaliPerNome = async() => {
        const dati = await fetch(server+"searchChannels?channelName="+query, {
            method: "GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        const datiJSON = await dati.json();
        setCanaliPerNome(datiJSON);
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
            <>
            <div className="universe">
                <Sidebar></Sidebar>
                <div className="feed">
                    <div className="feed__header">
                        <h2>Home</h2>
                    </div>
                    <div className="tweetBox">
                        <FormTweet update={updateHome}/>
                    </div>
                    {!query ? 
                        <InfiniteScroll
                            dataLength={data.length}
                            next={() => fetchPosts2(skip)}
                            hasMore={hasMore}
                            loader={<h4>Loading...</h4>}
                            >
                            {data.map((item) => {
                                return (
                                    <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                        <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                        comments={item.commenti} nomeImmagine={item.nomeImmagine} update={updateHome} data={item.data}
                                        destinatari={item.destinatari} proprietariCanale={[]} />
                                    </div>
                                );
                            })}
                        </InfiniteScroll>
                    :
                        <div>
                            {filteredData.map((item) => {
                                return (
                                    <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                        <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                        comments={item.commenti} nomeImmagine={item.nomeImmagine} update={updateHome} data={item.data}
                                        destinatari={item.destinatari} proprietariCanale={[]} />
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
                    <div className="feedRSS">
                        <input placeholder="Cerca squeal o canali..." onChange={(e) => {handleSearchChange(e)}} value={query}/>
                        {query && canaliPerNome.map((item,index) => {
                            return (
                                <div key={index}>
                                    <button className="link__canale" onClick={() => goToChannel(item)}>{item}</button>
                                </div>
                            );
                        })}
                    </div>
            </div>
        </>
        );
    } else {
        return (
            <>
            <div className="universe">
                <Sidebar></Sidebar>
                <div className="feed">
                    <div className="feed__header">
                        <h2>Home</h2>
                    </div>
                    {!query ? 
                        <InfiniteScroll
                            dataLength={data.length}
                            next={() => fetchPosts3(skip)}
                            hasMore={hasMore}
                            loader={<h4>Loading...</h4>}
                            >
                            {data.map((item) => {
                                return (
                                    <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                        <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                        comments={item.commenti} nomeImmagine={item.nomeImmagine} update={updateHome} data={item.data}
                                        destinatari={item.destinatari} proprietariCanale={[]} />
                                    </div>
                                );
                            })}
                        </InfiniteScroll>
                    :
                        <div>
                            {filteredData.map((item) => {
                                return (
                                    <div key={item.id} style={{marginTop:20, marginBottom:40, borderRadius:10, border:"solid"}}>
                                        <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length}
                                        comments={item.commenti} nomeImmagine={item.nomeImmagine} update={updateHome} data={item.data}
                                        destinatari={item.destinatari} proprietariCanale={[]} />
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
                    <div className="feedRSS">
                    </div>
            </div>
        </>
        );
    }
}

export default Home;


