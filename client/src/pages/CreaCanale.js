import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Option from "../components/Option";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import "../style/CreaCanale.css";

const server = process.env.REACT_APP_NODE_SERVER;

function CreaCanale() {

    const navigate = useNavigate();
                
    const [nomeCanale, setNomeCanale] = useState("");
    const [descrizione, setDescrizione] = useState("");

    const [users, setUsers] = useState(""); // tutti gli username
    const optionList = []; // tutti gli username formattati per react-select
    const [optionSelected, setOptionSelected] = useState(); // username selezionati come co-proprietari
    
  
    useEffect(() => {
        fetchUsers();
        setUsers(optionList);
    }, [])


    function clearInputs() {
        setNomeCanale("");
        setDescrizione("");
    }

    function handleChange(selected) {
        setOptionSelected(selected);
    }

    async function fetchUsers() {
        const dati = await fetch(server+"users", {
            method:"GET",
            headers: {
                "x-auth-token": sessionStorage.getItem("token")
            }
        });
        if (dati.status==200) {
            const datiJSON = await dati.json();
            console.log(datiJSON);
            let index = 0;
            for (index in datiJSON) {
                optionList.push({value:datiJSON[index], label:datiJSON[index]});
            }
        }
    }


    async function creaCanale(e) {
        e.preventDefault();
        if (nomeCanale.includes(" ")) {
            alert("Elimina gli spazi dal nome del canale...")
        } else {
            const proprietari = [];
            let index = 0;
            for (index in optionSelected) {
                proprietari.push(optionSelected[index].value);
            }
            const dati = await fetch(server+"channels", {
                method:"POST",
                headers:{
                    "x-auth-token":sessionStorage.getItem("token"),
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({nomeCanale: nomeCanale, proprietari: proprietari, descrizione:descrizione})
            });
            const datiJSON = await dati.json();
            alert(datiJSON);
            if (dati.status==201) {
                navigate("/profile");
            } else {
                setTimeout(() => clearInputs(), 2000);
            }
        }
    }

    if (sessionStorage.getItem("token")) {
        return (
            <div className="wrapper__crea__canale">
                <div className="form__container">
                    <h2>Crea subito il tuo canale</h2>
                    <form className="crea__canale__form" onSubmit={(e) => creaCanale(e)}>
                        <div className="form__item">
                            <label>Nome del canale</label>
                            <label>Il nome sarà formattato come '§nomecanale'</label>
                            <input required type="text" placeholder="Nome del canale" onChange={(e) => setNomeCanale(e.target.value)} value={nomeCanale} name="nomeCanale" />
                        </div>
                        <div className="form__item">
                            <label>Co-proprietari del canale</label>
                            <Select
                                styles={{
                                    control: (baseStyles) => ({
                                    ...baseStyles,
                                    width: "100%",
                                    borderRadius: "2px",
                                    border: "solid",
                                    }),
                                    option: (baseStyles) => ({
                                    ...baseStyles,
                                    borderRadius: "1px",
                                    "&:hover": {backgroundColor: "grey"}
                                    })
                                }}
                                options={users}
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
                        <div className="form__item">
                            <label>Descrizione del canale</label>
                            <textarea required rows="3" cols="50" placeholder="Scrivi una breve descrizione del canale..." value={descrizione} onChange={(e) => setDescrizione(e.target.value)}></textarea>
                        </div>
                        <input className="submit" type="submit" value="CREA CANALE" />
                        <input className="submit" onClick={() => navigate("/profile")} type="submit" value="Torna indietro" />
                    </form>
                </div>
            </div>
        );
    } else {
        return <Navigate replace to="/" />;
    }
}

export default CreaCanale;