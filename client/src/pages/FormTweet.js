import { Form } from "react-router-dom"
import { useState, useRef, useEffect } from "react";
import Option from "./Option";
import { default as ReactSelect } from "react-select";
import axios from 'axios';
import "../style/Home.css";
import ListaUtenti from "./ListaUtenti";


// <input type='file' name='file' onChange={handleDrop}></input>

const server = "http://192.168.1.54:8099/";

function FormTweet({update}) {

    const [image, setImage] = useState();
    const [pensiero, setPensiero] = useState("");
    const [tipoSqueal, setTipoSqueal] = useState();
    const [usersAndChannel, setUsersAndChannel] = useState([]);
    const [optionSelected, setOptionSelected] = useState();
    const optionList = [];

    useEffect(() => {
        fetchUsers();
        fetchChannels();
        optionList.push({value:"TUTTI", label:"TUTTI"});
        setUsersAndChannel(optionList);
    }, [])

    const clearInputs = () => {
        setPensiero("");
        setOptionSelected([]);
    }


    const fetchUsers = async() => {
        const dati = await fetch(server+sessionStorage.getItem("user")+"/users", {
            method:"GET",
        });
        const datiJSON = await dati.json();
        let index = 0;
        for (index in datiJSON) {
            optionList.push({value: datiJSON[index], label:datiJSON[index]})
        }
    }

    const fetchChannels = async() => {
        const dati = await fetch(server+sessionStorage.getItem("user")+"/canali", {
            method:"GET",
        });
        const datiJSON = await dati.json();
        let index = 0;
        for (index in datiJSON) {
            optionList.push({value: datiJSON[index], label:datiJSON[index]});
        }
    }

    /*function clearInputs() {
        setPensiero("");
        optionSelected([]);
      }*/


    function handleChange(selected) {
        let index = 0;
        let flag = false;
        for (index in selected) {
            if (selected[index].value=="TUTTI") {
                console.log("tutti selezionati");
                flag = true;
            } 
        }
        const tutti = [{value:"TUTTI", label:"TUTTI"}];
        if (flag) {
            setOptionSelected(tutti);
        } else {
            setOptionSelected(selected);
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault();
      };


    const handleDrop2 = (event) => {
        event.preventDefault();
        setImage(event.dataTransfer.files[0]);
    }


    async function posta(e) {
        e.preventDefault();
        const autore = sessionStorage.getItem("user");
        const formData = new FormData();
        if (optionSelected && optionSelected.length>0) {
            let index = 0;
            let destinatari = [];
            for (index in optionSelected) {
                destinatari.push(optionSelected[index].value);
            }
            formData.append("destinatari", destinatari);
        } else {
            alert("Specifica i destinatari del post");
            return;
        }
        formData.append("autore", autore);
        if (tipoSqueal=="testo") {
            formData.append("testo", pensiero);
        } else if (tipoSqueal=="immagine") {
            formData.append('file', image);
        }
        const dati = await fetch(server+"squealing", {
            method: "POST",
            body: formData
        });
        const datiJSON = await dati.json();
        if (dati.status==200) {
            setPensiero(datiJSON.messaggio);
            setTimeout(()=> {clearInputs()}, 3000);
            update();
        }
    }





return (
<form>
    <div className="tweetbox__input">
        {tipoSqueal=="testo" ?
            <input type="text" className="newTweet" placeholder="What's happening?" value={pensiero} onChange={(e) => setPensiero(e.target.value)}/>
        : (tipoSqueal=="immagine" ?
            (image ?     
                <div className="uploads">
                    <ul>
                        {image.name}
                    </ul>
                    <div className="actions">
                        <button onClick={() => setImage(null)}>Cancel</button>
                    </div>
                </div> : <div onDragOver={handleDragOver} onDrop={handleDrop2} className="dropzone">
                            <h2>Drag & Drop</h2>
                        </div>) :
            <div className="choice">
                <input type="button"  onClick={()=>setTipoSqueal("testo")} value="Scrivi"/>
                <input type="button" onClick={()=>setTipoSqueal("immagine")} value="Carica foto"/>
            </div>)}
        <ReactSelect
            styles={{
                control: (baseStyles) => ({
                ...baseStyles,
                width: "100%",
                borderRadius: "2px",
                border: "solid",
                backgroundImage:"linear-gradient(to right, #d8c8e3, #80bbd6df)",
                fontStyle: "italic"
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
    </div>
    <div className="tweetBoxButton">
        <div className="choice">
    {tipoSqueal=="testo" ? 
            <input type="button" className="tweetBox__tweetButton" onClick={() => setTipoSqueal("immagine")} value={"Carica foto"} /> :
            (tipoSqueal=="immagine") ? 
            <input type="button" className="tweetBox__tweetButton" onClick={() => setTipoSqueal("testo")} value={"Scrivi"} />: <></>}
            </div>
        <button className="tweetBox__tweetButton" onClick={(e) => posta(e)}>Tweet</button>
    </div>
</form>

)};

export default FormTweet;