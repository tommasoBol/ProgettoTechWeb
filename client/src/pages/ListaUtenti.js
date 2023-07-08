import { useEffect, useState } from "react";


const server = "http://192.168.1.54:8099/";

function ListaUtenti({listaUtentiECanali, scegliDestinatari, chiudi}) {

    
    const [checked, setChecked] = useState([]);
    let array = [];



    /*useEffect(() => {
        setChecked(Array(usersAndChannel.length).fill(false));
    }, [usersAndChannel.length])*/

    function onCheckBoxChange(i) {
        const updatedChecked = checked.map((item, index) => index === i ? !item : item);
        setChecked(updatedChecked);
        let index = 0;
        for (index in updatedChecked) {
            if (updatedChecked[index]) {
                scegliDestinatari(listaUtentiECanali[index]);
            }
        }
    }


return (
    <div className="popup">
        <div className="popup-list">
        {listaUtentiECanali.map((item,i) => {
            return (
                <div key={i} className="popup-item">
                    <label htmlFor={"check"+i}>{item}</label>
                    <input type="checkbox" checked={checked[i]} onChange={(i)=>onCheckBoxChange(i)} name={"check"+i}></input>
                </div>
            );
        })}
        </div>
        <div className="popup-button">
            <input type="button" value="OK" onClick={chiudi}></input>
        </div>
    </div>
)

}

export default ListaUtenti;