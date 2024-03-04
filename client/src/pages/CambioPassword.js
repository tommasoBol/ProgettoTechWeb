import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../style/CreaCanale.css";

const server = process.env.REACT_APP_NODE_SERVER;

function CambioPassword() {

    const navigate = useNavigate();
    const [oldPass, setOldPass] = useState();
    const [newPass, setNewPass] = useState();

    function clearInputs() {
        setOldPass("");
        setNewPass("");
    }

    const cambiaPassword = async(e) => {
        e.preventDefault();
        if (oldPass==newPass) {
            alert("La nuova password non può coincidere con la vecchia password");
            clearInputs();
            return;
        }
        const dati = await fetch(server+"users", {
            method:"PUT",
            headers:{
                "x-auth-token":sessionStorage.getItem("token"),
                "Content-Type":"application/json"
            },
            body: JSON.stringify({oldPass: oldPass, newPass: newPass})
        });
        const datiJSON = await dati.json();
        alert(datiJSON);
        if (dati.status==200) {
            alert("Sarai reindirizzato alla pagina di login")
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            navigate("/");
        } else {
            navigate("/profile");
        }
    }

    if (sessionStorage.getItem("token")) {
        return (
            <div className="wrapper__crea__canale">
                <div className="form__container">
                    <h2>Cambio Password</h2>
                    <form className="crea__canale__form" onSubmit={(e) => cambiaPassword(e)}>
                        <div className="form__item">
                            <label>Password attuale</label>
                            <input required type="text" onChange={(e) => setOldPass(e.target.value)} value={oldPass} />
                        </div>
                        <div className="form__item">
                            <label>Nuova password</label>
                            <input required type="text" onChange={(e) => setNewPass(e.target.value)} value={newPass} />
                        </div>
                        <input className="submit" type="submit" value="CAMBIA PASSWORD" />
                    </form>
                </div>
            </div>
        );
    } else {
        return <Navigate replace to="/" />;
    }
}

export default CambioPassword;