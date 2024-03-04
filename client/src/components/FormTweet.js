import { useState, useEffect } from "react";
import Option from "./Option";
import Select from 'react-select';
import "../style/Home.css";


// <input type='file' name='file' onChange={handleDrop}></input>

const server = process.env.REACT_APP_NODE_SERVER;

function FormTweet({update}) {

    const [image, setImage] = useState();
    const [pensiero, setPensiero] = useState("");
    const [tipoSqueal, setTipoSqueal] = useState();
    const [usersAndChannel, setUsersAndChannel] = useState([]);
    const [optionSelected, setOptionSelected] = useState([]);
    const [quota, setQuota] = useState();
    const [quotaIniziale, setQuotaIniziale] = useState();
    const optionList = [];

    useEffect(() => {
        fetchUsersAndChannels();
        fetchUserInfo();
        optionList.push({value:"TUTTI", label:"TUTTI"});
        setUsersAndChannel(optionList);
    }, [])

    const clearInputs = () => {
        setPensiero("");
        setImage();
        setOptionSelected([]);
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
            setQuota(datiJSON.quotaCaratteri);
            setQuotaIniziale(datiJSON.quotaCaratteri);
        }
    }

    const fetchUsersAndChannels = async() => {
        const dati = await fetch(server+"users-channels", {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        const datiJSON = await dati.json();
        let index = 0;
        for (index in datiJSON) {
            optionList.push({value: datiJSON[index], label:datiJSON[index]});
        }
    }


    function handleChange(selected) {
        setPensiero("");
        setImage();
        if (selected.length>0) {
            const lastSelected = selected[selected.length-1];
            const tutti = [{value: "TUTTI", label: "TUTTI"}];
            if (lastSelected.value=="TUTTI") {
                setOptionSelected(tutti);
            } else if (lastSelected.value[0]=='§') {
                const tmp = [lastSelected];
                setOptionSelected(tmp);
            } else {
                const rimanenti = selected.filter((item) => {return item.value[0]!='§' && item.value!="TUTTI"});
                setOptionSelected(rimanenti);
            }
            console.log("Opzione selezionata : " + optionSelected);
        } else {
            setOptionSelected([]);
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault();
      };


    const handleDrop2 = (event) => {
        event.preventDefault();
        if (optionSelected.length<1) {
            alert("Specifica i destinatari del post");
        } else {
            setImage(event.dataTransfer.files[0]);
            if (optionSelected.length>0 && (optionSelected[0].value=="TUTTI" || optionSelected[0].value[0]=='§')) {
                setQuota(quota-125);
            }
        }
    }

    const handleUpload = (event) => {
        event.preventDefault();
        if (optionSelected.length<1) {
            alert("Specifica i destinatari del post");
            window.location.reload();
        } else {
            setImage(event.target.files[0]);
            if (optionSelected.length>0 && (optionSelected[0].value=="TUTTI" || optionSelected[0].value[0]=='§')) {
                setQuota(quota-125);
            }
        }
    }


    async function posta(e) {
        e.preventDefault();
        if (quota>=0) { 
            const formData = new FormData();
            console.log(optionSelected);
            if (optionSelected.length==0) {
                alert("Specifica i destinatari del post");
                return;
            } else {
                let index = 0;
                let destinatari = [];
                
                for (index in optionSelected) {
                    destinatari.push(optionSelected[index].value);
                }
                formData.append("destinatari", destinatari);
                console.log(formData.get("destinatari"));
            }
            formData.append("quota", quota);
            if (tipoSqueal=="testo" && pensiero) {
                formData.append("testo", pensiero);
            } else if (tipoSqueal=="immagine" && image) {
                formData.append('file', image);
            } else {
                alert("Dai scrivi qualcosa...");
                return;
            }
            const dati = await fetch(server+"squeals", {
                method: "POST",
                headers: {
                    "x-auth-token": sessionStorage.getItem("token")
                },
                body: formData
            });
            const datiJSON = await dati.json();
            if (dati.status==200) {
                console.log(datiJSON);
                setPensiero("Squeal caricato correttamente");
                setTimeout(()=> {clearInputs()}, 3000);
                setQuotaIniziale(quota);
                update();
            }
        } else {
            alert("Hai finito i caratteri a disposizione per questo mese");
        }
    }


    const onTextChange = (e) => {
        if (optionSelected.length<1) {
            alert("Specifica prima i destinatari");
        } else {
            const length = calcolaLunghezzaTesto(e.target.value); 
            if (optionSelected.length>0 && (optionSelected[0].value=="TUTTI" || optionSelected[0].value[0]=='§')) {
                setQuota(quotaIniziale-length);
            }
            setPensiero(e.target.value)
        }
    }
    
    const calcolaLunghezzaTesto = (testo) => {
        let lunghezzaIniziale = testo.length;
        let lunghezzaMenzioni = 0;
        let index = 0;
        for (index in testo) {
            if (testo[index]=='@') {
                let index1 = 0;
                for (index1=index;testo[index1]!==' ' && index1<testo.length;index1++) {
                    console.log(index1);
                    lunghezzaMenzioni++;
                }
            }
        }
        console.log("Lunghezza menzioni : " + lunghezzaMenzioni);
        return lunghezzaIniziale-lunghezzaMenzioni;
    }


    const checkDestinatari = () => {
        if (optionSelected.length<1) {
            alert("Specifica prima i destinatari");
            
        }
    }


return (
<form>
    <div className="tweetbox__input">
        {tipoSqueal=="testo" ?
            /*<input type="text" className="newTweet" placeholder="What's happening?" value={pensiero} onChange={(e) => onTextChange(e)}/>*/
            <textarea  rows={5} cols={50} className="newTweet" placeholder="What's happening?" onChange={(e) => onTextChange(e)} value={pensiero}></textarea>
        : (tipoSqueal=="immagine" ?
            (image ?     
                <div className="uploads">
                    <ul>
                        {image.name}
                    </ul>
                    <div className="actions">
                        <button onClick={() => setImage(null)}>Cancel</button>
                    </div>
                </div> : <><div onDragOver={handleDragOver} onDrop={handleDrop2} className="dropzone">
                            <h2>Drag & Drop</h2>
                        </div>
                        <input type="file" onChange={handleUpload}></input></>) :
            <div className="choice">
                <input type="button"  onClick={()=>{setTipoSqueal("testo");}} value="Scrivi"/>
                <input type="button" onClick={()=>{setTipoSqueal("immagine");}} value="Carica foto"/>
            </div>)}
        <Select
            styles={{
                control: (baseStyles) => ({
                ...baseStyles,
                width: "100%",
                borderRadius: "2px",
                border: "solid",
                backgroundImage:"linear-gradient(to right, #d8c8e3, #80bbd6df)",
                }),
                option: (baseStyles) => ({
                ...baseStyles,
                borderRadius: "1px",
                "&:hover": {backgroundColor: "grey"},
                backgroundImage:"linear-gradient(to right, #d8c8e3, #80bbd6df)",
                fontStyle: "italic"
                })
            }}
            options={usersAndChannel}
            isMulti
            isSearchable={true}
            closeMenuOnSelect={false}
            hideSelectedOptions={true}
            onChange={handleChange}
            allowSelectAll={true}   
            value={optionSelected}
            components={
                <Option />
            }

        />
        <p>Caratteri menisili rimanenti: {quota}</p>
    </div>
    <div className="tweetBoxButton">
        <div className="choice">
    {tipoSqueal=="testo" ? 
            <input type="button" className="tweetBox__tweetButton" onClick={() => {setTipoSqueal("immagine");setQuota(quotaIniziale);setPensiero()}} value={"Carica foto"} /> :
            (tipoSqueal=="immagine") ? 
            <input type="button" className="tweetBox__tweetButton" onClick={() => {setTipoSqueal("testo");setQuota(quotaIniziale);setImage()}} value={"Scrivi"} />: <></>}
            </div>
        <button className="tweetBox__tweetButton" onClick={(e) => posta(e)}>Tweet</button>
    </div>
</form>

)};

export default FormTweet;