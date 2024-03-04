import "../style/Home.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const tornaSu = () => {
        navigate("/home");
        window.scrollTo({
            top: 0, 
            behavior: 'smooth'
          });
    }

    const goHome = () => {
        navigate("/home");
    }

    const goProfile = () => {
        navigate("/profile");
    }

    const goSubscriptions = () => {
        navigate("/subscriptions");
    }

    const logout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
    }

    if (sessionStorage.getItem("token")) {
    return (
        <>
            <div className="sidebar">
                <img src="deadbird.png"></img>
                <div className="sidebarOption" onClick={goHome}>
                    <span className="material-symbols-outlined"> home </span>
                    <h2>Home</h2>
                </div>
                <div className="sidebarOption" onClick={goProfile}>
                    <span className="material-symbols-outlined"> person </span>
                    <h2>Profile</h2>
                </div>
                <div className="sidebarOption" id="sub" onClick={goSubscriptions}>
                    <span className="material-symbols-outlined"> groups </span>
                    <h2>Canali</h2>
                </div>
                <div className="sidebarOption">
                    <button className="btn__tornaSu" onClick={tornaSu}>Tweet</button>
                </div>
                <div className="sidebarOption">
                    <button className="btn__tornaSu" onClick={logout}>Log out</button>
                </div>                
            </div>
        </>
    )} else {
        return (
        <>
        <div className="sidebar">
            <img src="deadbird.png"></img>
            <div className="sidebarOption" onClick={goHome}>
                <span className="material-symbols-outlined"> home </span>
                <h2>Home</h2>
            </div>
            <div className="sidebarOption">
                <button className="btn__tornaSu" onClick={() => navigate("/")}>Esci</button>
            </div>                
        </div>
    </>
    )}
}

export default Sidebar;