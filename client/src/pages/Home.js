import { useEffect, useState } from "react";
import { Form, Navigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import "../style/Home.css";
import "../style/Login.css"
import Sidebar from "./Sidebar"
import Tweet from "./Tweet";
import Option from "./Option";
import FormTweet from "./FormTweet";

import { default as ReactSelect } from "react-select";


const server = "http://192.168.1.54:8099/";


function Home() {
    const [limit, setLimit] = useState(15);
    const [skip, setSkip] = useState(0);
    const [data, setData] = useState([]);
    const [hasMore, setHasMore] = useState(true);


    const updateHome = () => {
        fetchPosts3(0);
        console.log("Fetching...");
    }


    /*async function photo() {
        const dati = await fetch(server+"photo", {
            method:"GET"
        });
        const datiBLOB = await dati.blob();
        console.log(datiBLOB);
        var reader = new FileReader();
        reader.readAsDataURL(datiBLOB); 
        reader.onloadend = function() {
            var base64data = reader.result;                
            console.log(base64data);
        }
    }*/     

    useEffect(() => {
        fetchPosts2();
    } , []);


    const fetchPosts2 = async() => {
        const usrnm = sessionStorage.getItem("user");
        const res = await fetch(server+usrnm+"/posts?skip="+skip+"&limit="+limit, {
            method:"GET"
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

    const fetchPosts3 = async(skip) => {
        const usrnm = sessionStorage.getItem("user");
        const res = await fetch(server+usrnm+"/posts?skip="+skip+"&limit="+limit, {
            method:"GET"
        });
        const resJSON = await res.json();  
        if (resJSON.length>0) {
            setData(resJSON);
            setSkip(skip+limit);
        } else {
            setHasMore(false);
        }
        console.log(skip);
        console.log(resJSON);
    }


    if (sessionStorage.getItem("autenticato")==="true") {
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
                        <InfiniteScroll
                            dataLength={data.length}
                            next={fetchPosts2}
                            hasMore={hasMore}
                            loader={<h4>Loading...</h4>}
                            >
                            {data.map((item) => {
                                return (
                                    <div key={item.id} style={{marginTop:20, marginBottom:20, borderRadius:10, border:"solid"}}>
                                        <Tweet autore={item.autore} corpo={item.corpo} id={item.id} rPos={item.rPos.length} rNeg={item.rNeg.length} comments={item.commenti} nomeImmagine={item.nomeImmagine} update={updateHome} data={item.data} />
                                    </div>
                                );
                            })}
                        </InfiniteScroll>
                </div>
                    <div className="feedRSS">
                </div>
            </div>
        </>
        );
    } else {
        return <Navigate replace to="/" />;
    }
}

export default Home;
