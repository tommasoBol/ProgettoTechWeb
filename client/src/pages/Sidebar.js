import "../style/Home.css";

function Sidebar() {

    const tornaSu = () => {
        window.scrollTo({
            top: 0, 
            behavior: 'smooth'
          });
    }

    return (
        <>
            <div className="sidebar">
                <img src="deadbird.png"></img>
                <div className="sidebarOption">
                    <span className="material-icons"> home </span>
                    <h2>Home</h2>
                </div>
                <div className="sidebarOption">
                    <span className="material-icons"> search </span>
                    <h2>Explore</h2>
                </div>
                <div className="sidebarOption">
                    <span className="material-icons"> notifications_none </span>
                    <h2>Notifications</h2>
                </div>
                <div className="sidebarOption">
                    <span className="material-icons"> mail_outline </span>
                    <h2>Messages</h2>
                </div>
                <div className="sidebarOption">
                    <button onClick={tornaSu}>Tweet</button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;