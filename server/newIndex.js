const express = require("express");
const fs = require("fs");
const fsProm = require("fs/promises");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const JWT = require("jsonwebtoken");
const multer = require('multer');
const upload = multer({ dest: "files/" });

require("dotenv").config();

app = express()
app.use(cors());
app.use(bodyParser.json());
app.use('/files', express.static('files'));


let usersJSON = [];
let squealsJSON = [];
let channelsJSON = [];
let news = [];
const criticMassRate = 0.25;
let uniqueId;

app.listen(8099, async function() {
    try {
        if (fs.existsSync("./users.json")) {
            let users = await fsProm.readFile("./users.json");
            usersJSON = JSON.parse(users);
        }
        if (fs.existsSync("./squeals.json")) {
            let squeals = await fsProm.readFile("./squeals.json");
            squealsJSON = JSON.parse(squeals);
        }
        if (fs.existsSync("./channels.json")) {
            let channels = await fsProm.readFile("./channels.json");
            channelsJSON = JSON.parse(channels);
            console.log(channelsJSON);
        }
        if (fs.existsSync("./ricariche.json")) {
            let ricariche = await fsProm.readFile("./ricariche.json");
            const ricaricheJSON = JSON.parse(ricariche);
            const today = new Date();
            const todayDate = today.getDate();
            const todayMonth = today.getMonth();
            const todayYear = today.getFullYear();
            if (!ricaricheJSON.includes(todayMonth) && !ricaricheJSON.includes(todayYear)) {
                const newRicaricheJSON = [todayYear,todayMonth];
                fsProm.writeFile("./ricariche.json", JSON.stringify(newRicaricheJSON));
                console.log("Data1");
            } else if (todayDate==1 && !ricaricheJSON.includes(todayMonth)) {
                const notMods = usersJSON.filter((item) => {return item.isMod==false});
                notMods.forEach((item) => item.quotaCaratteri+=1000);
                ricaricheJSON.push(todayMonth);
                fsProm.writeFile("./ricariche.json", JSON.stringify(ricaricheJSON));
                console.log("Data2");
            } else if (todayDate==1 && !ricaricheJSON.includes(todayYear)) {
                const notMods = usersJSON.filter((item) => {return item.isMod==false});
                notMods.forEach((item) => item.quotaCaratteri+=1000);
                const newRicaricheJSON = [todayYear,todayMonth];
                fsProm.writeFile("./ricariche.json", JSON.stringify(newRicaricheJSON));
                console.log("Datat3");
            } else {
                console.log("Data4");
            }
        }
        uniqueId = (squealsJSON.length>0) ? squealsJSON[squealsJSON.length-1].id : 0;
        console.log("UniqueId: " + uniqueId);
        console.log("\nServer is running\n");
        getNews();
    } catch (err) {
        console.log(err);
        return;
    }

});


// APP

setInterval(async() => {
    if (news.length==0) {
        getNews();
    }
    writeNews();
    await fsProm.writeFile("./users.json", JSON.stringify(usersJSON, null, 4));
    await fsProm.writeFile("./squeals.json", JSON.stringify(squealsJSON, null, 4));
    await fsProm.writeFile("./channels.json", JSON.stringify(channelsJSON, null, 4));
    console.log("scritto");
}, 12000);

const authToken = (token) => {
    if (!token) {
        return null;
    }
    try {
        const user = JWT.verify(token, process.env.JWT_SECRET);
        console.log(user.username);
        return user.username;
    } catch (error) {
        return null;
    }
};


const checkAuthorizationOnSqueal = (username, squealID) => {
    const utente = usersJSON.find((item) => {return item.username==username});
    const flag = squealsJSON.find((item) => 
        {return (item.id==squealID)&&((item.autore==username) || (item.destinatari.includes(username) || (item.destinatari.some((item)=>{return utente.iscrizioni.indexOf(item)>=0}))))});
    const canaliDiProprietaUtente = channelsJSON.filter((item2) => item2.proprietari.includes(username));
    const nomiCanaliDiProprietaUtente = [];
    canaliDiProprietaUtente.forEach((item) => nomiCanaliDiProprietaUtente.push(item.nome));
    const flag1 = squealsJSON.find((item) => {return ((item.id==squealID)&&(item.destinatari.some((item) => nomiCanaliDiProprietaUtente.includes(item))))});
    if (flag||flag1) return true;
    return false;
    
}


// LOGIN
app.get("/users", (req,res,next) => {
    if (!req.query.username || !req.query.password) {
        next();
        return;
    }
    const usernameInput = req.query.username;
    const passwordInput = req.query.password;
    const account = usersJSON.find((item) => {return ((item.username==usernameInput) && (item.password==passwordInput))});
    if (account) {
        if (!account.bloccato) {
            const username = account.username;
            const mod = account.isMod;
            const accessToken = JWT.sign(
                { username },
                process.env.JWT_SECRET,
                {expiresIn:"10h"}
                )
            res.status(200).json({token:accessToken, isMod: mod});
        } else {
            res.status(401).json("Account bloccato");    
        }
    } else {
        res.status(400).json("Credenziali non valide");
    }
});

// REGISTRAZIONE
app.post("/users", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log("REGISTRAZIONE " + username + " " + password);
    if (usersJSON.find((item)=> {return item.username==username})) {
        res.status(409).json("Username già in uso");
        return;
    } else {
        const nuovoUtente = {
            username: username,
            password: password,
            isMod: false,
            quotaCaratteri: 1000,
            iscrizioni: [],
            bloccato: false
        };
        usersJSON.push(nuovoUtente);
        const accessToken = JWT.sign(
            { username },
            process.env.JWT_SECRET,
            {expiresIn: "10h"}
        );
        res.status(201).json({token: accessToken });
    }
});


// ELIMINAZIONE ACCOUNT  // ancora da implementare nel front end
app.delete("/users", (req,res) => {
    const token = req.header("x-auth-token");
    if(token) {
        const usernameFromToken = authToken(token);
        const usernameInput = req.query.username;
        const passwordInput = req.query.password;
        const utenteDaEliminare = usersJSON.find((item) => {return ((item.username==usernameInput)&&(item.password==passwordInput))});
        if (utenteDaEliminare && utenteDaEliminare.username==usernameFromToken) {
            usersJSON = usersJSON.filter((item)=> {return item.username!=utenteDaEliminare.username});
            res.status(200).json("Utente eliminato con successo");
        } else {
            res.status(400).json("Impossibile completare l'operazione");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// LISTA USERNAME E NOMI CANALI A CUI L'UTENTE è ISCRITTO
// CI SERVE PER QUANDO DOBBIAMO DECIDERE I DESTINATARI DELLO SQUEAL
app.get("/users-channels", (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const utente = usersJSON.find((item) => {return item.username==usernameFromToken});
        let daInviare = [];
        let index = 0;
        for (index in usersJSON) {
            if (usersJSON[index].username!=usernameFromToken) {
                daInviare.push(usersJSON[index].username);
            }
        }
        index = 0;
        for (index in channelsJSON) {
            if (channelsJSON[index].proprietari.indexOf(utente.username)>=0) {
                daInviare.push(channelsJSON[index].nome);
            }
        }
        index = 0;
        let index2 = 0;
        const iscrizioniValide = []
        console.log("UTENTE chiamando users-channel : " + utente);
        for (index in utente.iscrizioni) {
            for (index2 in channelsJSON) {
                if (utente.iscrizioni[index]==channelsJSON[index2].nome && !channelsJSON[index2].official) {
                    iscrizioniValide.push(utente.iscrizioni[index]);
                }
            }
        }
        daInviare = daInviare.concat(iscrizioniValide);
        res.status(200).json(daInviare);
    } else {
        res.status(401).json("Non autorizzato");
    }
});

// LISTA USERNAMES. CI SERVE PER DECIDERE I PROPRIETARI DEL CANALE CHE STIAMO CREANDO
app.get("/users", (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const allUsers = usersJSON.filter((item) => {return item.username!=usernameFromToken});
        const allUsernames = [];
        allUsers.forEach((item) => allUsernames.push(item.username));
        res.status(200).json(allUsernames);
    } else {
        res.status(401).json("Non autorizzato");
    }
})


// INFORMAZIONI SU SINGOLO UTENTE
app.get("/users/:username", (req,res) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const usernameDaCercare = req.params.username;
    if (token&&usernameFromToken==usernameDaCercare) {
        const utente = usersJSON.find((item) => {return item.username==usernameDaCercare});
        res.status(200).json(utente);
    } else {
        res.status(401).json("Non autorizzato");
    }
});

//CAMBIO PASSWORD
app.put("/users", (req,res) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const { oldPass, newPass } = req.body;
    if (token) {
        const utente = usersJSON.find((item) => {return item.username==usernameFromToken});
        if (utente && utente.password==oldPass) {
            utente.password = newPass;
            res.status(200).json("Cambio password avvenuto con successo");
        } else {
            res.status(400).json("Errore nella richiesta");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
})



// LISTA SQUEALS PER HOMEPAGE
app.get("/squeals", (req,res) => {
    const token = req.header("x-auth-token");
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    console.log("Skip: " + skip);
    const skipData = [];
    let usernameFromToken;
    let squealsPerUtente = [];
    if (token!="null") { // ha il token quindi è un utente squealer
        console.log(token);
        usernameFromToken = authToken(token);
        const utente = usersJSON.find((item) => {return item.username==usernameFromToken});
        squealsPerUtente = squealsJSON.filter((item) => 
        {
            return item.destinatari.includes("TUTTI") || item.destinatari.includes(usernameFromToken) ||
            item.destinatari.some((item)=>{return utente.iscrizioni.indexOf(item)>=0})
        });

    } else { // non ha il token quindi potrà visualizzare solo i post dei §CANALI
        squealsPerUtente = squealsJSON.filter((item) => {return item.destinatari.includes("TUTTI")});
    }
    let i;
    let j = (squealsPerUtente.length-limit-skip>=0) ? (squealsPerUtente.length-limit-skip) : 0;
    if (skip<=squealsPerUtente.length) {
        for (i=squealsPerUtente.length-1-skip;i>=j;i--) {
            skipData.push(squealsPerUtente[i]);
            if (token!="null" && squealsPerUtente[i].visualizzazioni.indexOf(usernameFromToken)==-1) {
                squealsPerUtente[i].visualizzazioni.push(usernameFromToken);
            }
        }
    }
    res.status(200).json(skipData);
});


// LISTA SQUEALS PER PROFILO
app.get("/profile-squeals", (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const skip = parseInt(req.query.skip);
        const limit = parseInt(req.query.limit);
        const skipData = [];
        const squealsPerUtente = squealsJSON.filter((item) => {return item.autore==usernameFromToken ||
                                                                 item.destinatari.indexOf(usernameFromToken)>=0});
        let i;
        let j = (squealsPerUtente.length-limit-skip>=0) ? (squealsPerUtente.length-limit-skip) : 0;
        if (skip<=squealsPerUtente.length) {
            for (i=squealsPerUtente.length-1-skip;i>=j;i--) {
                skipData.push(squealsPerUtente[i]);
            }
        }
        res.status(200).json(skipData);                                                                  
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// POSTA UN NUOVO SQUEAL
app.post("/squeals", upload.any(), (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);

        const reqBody = req.body;
        const destinatari = reqBody.destinatari.split(",");
        console.log(destinatari);
        const file = req.files[0];
        const nomeFile = (file) ? file.filename : ""; 
        const corpo = (reqBody.testo) ? reqBody.testo : "";

        const utenteScrittore = usersJSON.find((item) => {return item.username==usernameFromToken});
        utenteScrittore.quotaCaratteri = parseInt(reqBody.quota);

        const newSqueal = {
            id: uniqueId+1,
            autore: usernameFromToken,
            destinatari: destinatari,
            corpo: corpo,
            nomeImmagine: nomeFile,
            rPos: [],
            rNeg: [],
            commenti: [],
            categoria: "",
            canaliRedazione: [],
            visualizzazioni: [],
            data: new Date()
        };
        uniqueId++;
        squealsJSON.push(newSqueal);
        res.status(200).json(newSqueal);
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// ELIMINA POST
app.delete("/squeals/:squealID", (req,res) => {
    const idSquealDaEliminare = req.params.squealID;
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const flag = squealsJSON.findIndex((item) => {return ((item.id==idSquealDaEliminare)&&(item.autore==usernameFromToken))});
        if (flag>=0) {
            squealsJSON.splice(flag,1);
            res.status(200).json("Squeal eliminato");
        } else {
            res.status(401).json("Non autorizzato");    
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// VISUALIZZA UNO SQUEAL
app.post("/squeals/:squealID/visualizzazioni", (req,res) => {
    const token = req.header("x-auth-token");
    const squealID = req.params.squealID;
    const usernameFromToken = authToken(token);
    const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
    if (token&&flag) {
        const squealDaVisualizzare = squealsJSON.find((item) => {return item.id==squealID});
        if (squealDaVisualizzare.visualizzazioni.indexOf(usernameFromToken)>=0) {
            res.status(200).json("Gia visualizzato");
        } else {
            squealDaVisualizzare.visualizzazioni.push(usernameFromToken);
            res.status(200).json("Nuova visualizzazione");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
})


// METTI LIKE AD UNO SQUEAL
app.post("/squeals/:squealID/rPos", (req,res) => {
    const token = req.header("x-auth-token");
    const squealID = req.params.squealID;
    const usernameFromToken = authToken(token);
    const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
    const squealToLike = squealsJSON.find((item) => {return item.id==squealID});
    if (token&& (flag||squealToLike.destinatari.indexOf("TUTTI")>=0)) { 
        let wasDislike = false;
        let wasLike = false;

        
        if (squealToLike) {
            const userAlreadyLiked = squealToLike.rPos.indexOf(usernameFromToken);
            const userDisliked = squealToLike.rNeg.indexOf(usernameFromToken);
            if(userAlreadyLiked>=0) {
                squealToLike.rPos.splice(userAlreadyLiked, 1);
                wasLike = true;
            } else if (userDisliked>=0) {
                squealToLike.rNeg.splice(userDisliked, 1);
                wasDislike = true;
                squealToLike.rPos.push(usernameFromToken);
            } else {
                squealToLike.rPos.push(usernameFromToken); 
            }


            if (squealToLike.rPos.length > squealToLike.visualizzazioni.length*criticMassRate && squealToLike.rNeg.length> squealToLike.visualizzazioni.length*criticMassRate) {
                console.log("controverso");
                if (squealToLike.categoria && squealToLike.categoria=="popolare") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri -= 100;
                    let i = squealToLike.destinatari.indexOf("§POPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                } else if (squealToLike.categoria && squealToLike.categoria=="impopolare") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri += 100;
                    let i = squealToLike.destinatari.indexOf("§UNPOPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                } else if (!squealToLike.categoria) {
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                }
            }
            else if (squealToLike.rPos.length > squealToLike.visualizzazioni.length*criticMassRate) {
                console.log("popolare");
                if (squealToLike.categoria && squealToLike.categoria=="impopolare") { // se il post era etichettato come impopolare, significa che all'autore del post erano stati levati dei caratteri. dobbiamo quindi ridargli quelli che gli sono stati levati e dargli quelli che si merita in quanto il post è diventato popolare
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri += 200;
                    squealToLike.categoria = "popolare";
                    let i = squealToLike.destinatari.indexOf("§UNPOPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§POPULAR");
                } else if (squealToLike.categoria && squealToLike.categoria=="controverso") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri += 100;
                    let i = squealToLike.destinatari.indexOf("§CONTROVERSIAL");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.categoria = "popolare";
                    squealToLike.destinatari.push("§POPULAR");
                } else if (!squealToLike.categoria) { // in questo caso, gil diamo solo quelli che merita
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri += 100;
                    squealToLike.categoria = "popolare";
                    squealToLike.destinatari.push("§POPULAR");
                }  
            } else {
                squealToLike.categoria = "";
                let popular = squealToLike.destinatari.indexOf("§POPULAR");
                let controversial = squealToLike.destinatari.indexOf("§CONTROVERSIAL");
                if (popular>=0) {
                    squealToLike.destinatari.splice(popular,1);
                }
                if (controversial>=0) {
                    squealToLike.destinatari.splice(controversial, 1);
                }
            }
            res.status(200).json({wasdislike: wasDislike, waslike: wasLike}); 
        } else {
            res.status(400).json("Impossibile trovare lo squeal");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// METTI DISLIKE AD UNO SQUEAL
app.post("/squeals/:squealID/rNeg", (req,res) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const squealID = req.params.squealID;
    const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
    if (token&&flag) {
        let wasDislike = false;
        let wasLike = false;

        const squealToLike = squealsJSON.find((item) => {return item.id==squealID});
        if (squealToLike) {
            const userLiked = squealToLike.rPos.indexOf(usernameFromToken);
            const userAlreadyDisliked = squealToLike.rNeg.indexOf(usernameFromToken);
            if(userLiked>=0) {
                squealToLike.rPos.splice(userLiked, 1);
                wasLike = true;
                squealToLike.rNeg.push(usernameFromToken);
            } else if (userAlreadyDisliked>=0) {
                squealToLike.rNeg.splice(userAlreadyDisliked, 1);
                wasDislike = true;
            } else {
                squealToLike.rNeg.push(usernameFromToken); 
            }


            if (squealToLike.rPos.length > squealToLike.visualizzazioni.length*criticMassRate && squealToLike.rNeg.length> squealToLike.visualizzazioni.length*criticMassRate) {
                if (squealToLike.categoria && squealToLike.categoria=="popolare") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri -= 100;
                    let i = squealToLike.destinatari.indexOf("§POPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                } else if (squealToLike.categoria && squealToLike.categoria=="impopolare") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri += 100;
                    let i = squealToLike.destinatari.indexOf("§UNPOPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                } else if (!squealToLike.categoria) {
                    squealToLike.destinatari.push("§CONTROVERSIAL");
                    squealToLike.categoria = "controverso";
                }
            }
            else if (squealToLike.rNeg.length > squealToLike.visualizzazioni.length*criticMassRate) {
                if (squealToLike.categoria && squealToLike.categoria=="popolare") { 
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri -= 200;
                    squealToLike.categoria = "impopolare";
                    let i = squealToLike.destinatari.indexOf("§POPULAR");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.destinatari.push("§UNPOPULAR");
                } else if (squealToLike.categoria && squealToLike.categoria=="controverso") {
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri -= 100;
                    let i = squealToLike.destinatari.indexOf("§CONTROVERSIAL");
                    squealToLike.destinatari.splice(i,1);
                    squealToLike.categoria = "impopolare";
                    squealToLike.destinatari.push("§UNPOPULAR");
                } else if (!squealToLike.categoria) { // in questo caso, gil diamo solo quelli che merita
                    let autore = usersJSON.find((item) => {return item.username==squealToLike.autore});
                    autore.quotaCaratteri -= 100;
                    squealToLike.categoria = "impopolare";
                    squealToLike.destinatari.push("§UNPOPULAR");
                } 
            } else {
                squealToLike.categoria = "";
                let unpopular = squealToLike.destinatari.indexOf("§UNPOPULAR");
                let controversial = squealToLike.destinatari.indexOf("§CONTROVERSIAL");
                if (unpopular>=0) {
                    squealToLike.destinatari.splice(unpopular,1);
                }
                if (controversial>=0) {
                    squealToLike.destinatari.splice(controversial, 1);
                }
            }
            res.status(200).json({wasdislike: wasDislike, waslike: wasLike}); 
        } else {
            res.status(400).json("Impossibile trovare lo squeal");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// COMMENTI DI UNO SQUEAL
app.get("/squeals/:squealID/commenti", (req,res) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const squealID = req.params.squealID;
    const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
    if (token&&flag) {
        const squealDaTrovare = squealsJSON.find((item) => {return item.id==squealID});
        res.status(200).json(squealDaTrovare.commenti);
    } else {
        res.status(401).json("Non autorizzato");
    }
})


// INSERISCI UN COMMENTO AD UNO SQUEAL
app.post("/squeals/:squealID/commenti", (req,res) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const squealID = req.params.squealID;
    const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
    const squealDaCommentare = squealsJSON.find((item) => {return item.id==squealID});
    if (token&&(flag||squealDaCommentare.destinatari.indexOf("TUTTI")>=0)) {
        const commento = req.body.commento;
        
        const nuovoCommento = {
            id: (squealDaCommentare.commenti.length>0) ? squealDaCommentare.commenti[squealDaCommentare.commenti.length-1].id + 1 : 1,
            autore: usernameFromToken,
            messaggio: commento,
            data: new Date()
        }
        squealDaCommentare.commenti.push(nuovoCommento);
        res.status(200).json("Commento scritto correttamente");
    } else {
        res.status(401).json("Non autorizzato");
    }
});


// ELIMINA UN COMMENTO 
app.delete("/squeals/:squealID/commenti/:commentoID", (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const squealID = req.params.squealID;
        const squealDaScommentare = squealsJSON.find((item) => {return item.id==squealID});
        const flag = checkAuthorizationOnSqueal(usernameFromToken, squealID);
        if (squealDaScommentare && flag) {
            const commentoID = req.params.commentoID;
            const indexCommento = squealDaScommentare.commenti.findIndex((item) => {return item.id==commentoID});
            if (indexCommento>=0 /*&& squealDaScommentare.commenti[indexCommento].autore==usernameFromToken*/) {
                squealDaScommentare.commenti.splice(indexCommento,1);
                res.status(200).json("Commento eliminato correttamente");
            } else {
                res.status(401).json("Non autorizzato");
            }
        } else {
            res.status(400).json("Squeal non esistente");
        }
    } else {
        res.status(401).json("Non autorizzato");
    }
});



// CREAZIONE NUOVO CANALE
app.post("/channels", (req,res) => {
    const token = req.header("x-auth-token");
    if (token) {
        const usernameFromToken = authToken(token);
        const nomeInput = req.body.nomeCanale;
        const nomeFormattato = "§"+nomeInput.toLowerCase();
        const proprietariInput = req.body.proprietari;
        const descrizioneInput = req.body.descrizione;
        if (channelsJSON.find((item) => {return item.nome==nomeFormattato})) {
            res.status(409).json("Nome già in uso");
            return;
        } else {
            proprietariInput.push(usernameFromToken);
            const newChannel = {
                nome: nomeFormattato,
                descrizione: descrizioneInput,
                proprietari: proprietariInput,
                iscritti: [],
                dataCreazione: new Date(),
                official: false
            };
            channelsJSON.push(newChannel);
            res.status(201).json("Canale creato correttamente");
        }
    } else {
        res.status(401).json("Non autorizzato"); 
    }
}); 


// LISTA CANALI DI PROPRIETA
app.get("/channels", (req,res, next) => {
    const token = req.header("x-auth-token");
    const usernameFromToken = authToken(token);
    const usernameInput = req.query.proprietario;
    if (token && usernameFromToken===usernameInput) {
        const lista = channelsJSON.filter((item) => item.proprietari.indexOf(usernameFromToken)>=0);
        console.log(lista);
        res.status(200).json(lista);
    } else {
        res.status(401).json("Non autorizzato"); 
    }
});


// INFO SU UN CANALE
app.get("/channels/:channelName", (req,res) => {
    const token = req.header("x-auth-token");
    const nomeCanaleDaCercare = req.params.channelName;
    console.log("CANALE DA CERCARE : " + nomeCanaleDaCercare);
    const usernameFromToken = authToken(token);
    const canaleDaCercare = channelsJSON.find((item) => {return item.nome==nomeCanaleDaCercare});
    if (token) {
        res.status(200).json(canaleDaCercare);
    } else {
        res.status(401).json("Non autorizzato"); 
    }
})

// UTENTE PIU ATTIVO DI UN DETERMINATO CANALE
app.get("/channels/:channelName/active", (req,res) => {
    const token = req.header("x-auth-token");
    const nomeCanaleDaCercare = req.params.channelName;
    const usernameFromToken = authToken(token);
    const canaleDaCercare = channelsJSON.find((item) => {return item.nome==nomeCanaleDaCercare});
    if (token) {
        const squealsDelCanale = squealsJSON.filter((item) => item.destinatari.includes(nomeCanaleDaCercare));
        let i = 0;
        let numSquealPerIscritto = [];
        for (i in canaleDaCercare.iscritti) {
            let somma = squealsDelCanale.filter((item) => item.autore==canaleDaCercare.iscritti[i]).length;
            numSquealPerIscritto.push({nome:canaleDaCercare.iscritti[i], num:somma});
        }
        let piuAttivo;
        i = 0;
        let maxNum = 0;
        for (i in numSquealPerIscritto) {
            if (numSquealPerIscritto[i].num>maxNum) {
                maxNum = numSquealPerIscritto[i].num;
                piuAttivo = numSquealPerIscritto[i];
            }
        }
        res.status(200).json(piuAttivo);
    } else {
        res.status(401).json("Non autorizzato"); 
    }
})


// SQUEALS CHE HANNO COME DESTINATARIO UN DETERMINATO CANALE
app.get("/channels/:channelName/squeals", (req,res) => {
    const token = req.header("x-auth-token");
    const nomeCanaleDaCercare = req.params.channelName;
    const usernameFromToken = authToken(token);
    const canaleDaCercare = channelsJSON.find((item) => item.nome==nomeCanaleDaCercare);
    console.log("CIAO : " + nomeCanaleDaCercare);
    const isSubscribed = canaleDaCercare.iscritti.indexOf(usernameFromToken)>=0;
    const isOwner = canaleDaCercare.proprietari.indexOf(usernameFromToken)>=0;
    if (token/*&&(isSubscribed||isOwner)*/) {
        const skip = req.query.skip;
        const limit = req.query.limit;
        const listaSquealPerCanale = squealsJSON.filter((item) => item.destinatari.includes(canaleDaCercare.nome));

        const skipData = [];
        let i;
        let j = (listaSquealPerCanale.length-limit-skip>=0) ? (listaSquealPerCanale.length-limit-skip) : 0;
        if (skip<=listaSquealPerCanale.length) {
            for (i=listaSquealPerCanale.length-1-skip;i>=j;i--) {
                skipData.push(listaSquealPerCanale[i]);
            }
        }   
        res.status(200).json(skipData);
    } else {
        res.status(401).json("Non autorizzato"); 
    }
})



// ISCRIZIONE AD UN CANALE
app.post("/channels/:channelName/iscritti", (req,res) => {
    const token = req.header("x-auth-token");
    const nomeCanaleDaCercare = req.params.channelName;
    const usernameFromToken = authToken(token);
    const userDaCercare = usersJSON.find((item) => item.username == usernameFromToken);
    const canaleDaCercare = channelsJSON.find((item) => item.nome==nomeCanaleDaCercare);
    if (token) {
        if (canaleDaCercare.iscritti.includes(usernameFromToken) || canaleDaCercare.proprietari.includes(usernameFromToken)) {
            res.status(400).send(); 
        } else {
            canaleDaCercare.iscritti.push(usernameFromToken);
            userDaCercare.iscrizioni.push(nomeCanaleDaCercare);
            res.status(200).json("Iscrizione avvenuta con successo");
        }
    } else {
        res.status(401).json("Non autorizzato"); 
    }
});

// DISISCRIZIONE AD UN CANALE
app.delete("/channels/:channelName/iscritti", (req,res) => {
    const token = req.header("x-auth-token");
    const nomeCanaleDaCercare = req.params.channelName;
    console.log("DAI DIOCANE : " + nomeCanaleDaCercare);
    const usernameFromToken = authToken(token);
    const userDaCercare = usersJSON.find((item) => item.username == usernameFromToken);
    const canaleDaCercare = channelsJSON.find((item) => item.nome==nomeCanaleDaCercare);
    if (token) {
        if (!canaleDaCercare.iscritti.includes(usernameFromToken) || canaleDaCercare.proprietari.includes(usernameFromToken)) {
            res.status(400).send();
        } else {
            let index = canaleDaCercare.iscritti.indexOf(usernameFromToken);
            let index2 = userDaCercare.iscrizioni.indexOf(nomeCanaleDaCercare);
            userDaCercare.iscrizioni.splice(index2, 1);
            canaleDaCercare.iscritti.splice(index, 1);
            res.status(200).json("disiscritto correttamente");
        }
    } else {
        res.status(401).json("Non autorizzato"); 
    }
});


// LISTA NOMI CANALI PER RICERCA DA PARTE DELL'UTENTE
app.get("/searchChannels", (req,res) => {
    const query = req.query.channelName;
    const token = req.header("x-auth-token");
    if (token) {
        const canaliValidi = channelsJSON.filter((item) => item.nome.toLowerCase().includes(query.toLowerCase()));
        const daInviare = [];
        let index = 0;
        for (index in canaliValidi) {
            daInviare.push(canaliValidi[index].nome);
            console.log("NOME CANALE : " + canaliValidi[index].nome);
        };
        res.status(200).json(daInviare);
    } else {
        res.status(401).json("Non autorizzato"); 
    }
});



//NEWS API
const getNews = async() => {
    const dati = await fetch("https://newsapi.org/v2/top-headlines?country=it&apiKey=59e778fb153a42878f191c900ce256b9");
    const datiJSON = await dati.json();
    let index = 0;
    for (index in datiJSON.articles) {
        news.push(datiJSON.articles[index].title);
    }
}

const writeNews = () => {
    let randomIndex = Math.floor(Math.random() * news.length);
    console.log("INDICE RANDOM " + randomIndex);
    const newSqueal = {
        id: uniqueId+1,
        autore: "REDAZIONE SQUEALER",
        destinatari: ["§NEWS"],
        corpo: "NEWS :" + news[randomIndex],
        nomeImmagine: "",
        rPos: [],
        rNeg: [],
        commenti: [],
        categoria: "",
        canaliRedazione: [],
        visualizzazioni: [],
        data: new Date()
    };
    squealsJSON.push(newSqueal);
    uniqueId++;
    news.splice(randomIndex, 1);
}






// MODERATOR

app.get('/api/posts', (req, res) => {
  try {
    const datiPosts = fs.readFileSync(path.join(__dirname, 'squeals.json'));
    const posts = JSON.parse(datiPosts);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento dei post.' });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;

  try {
    let datiPosts = fs.readFileSync(path.join(__dirname, 'squeals.json'));
    let posts = JSON.parse(datiPosts);

    const updatedPosts = posts.filter((post) => post.id !== parseInt(postId));
    fs.writeFileSync(path.join(__dirname, 'squeals.json'), JSON.stringify(updatedPosts, null, 2));

    res.status(200).json({ message: 'Post eliminato con successo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione del post.' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const datiUtenti = fs.readFileSync(path.join(__dirname, 'users.json'));
    const utenti = JSON.parse(datiUtenti);
    res.json(utenti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento degli utenti.' });
  }
});

// Aggiunta della gestione dell'endpoint /api/users/:username
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  try {
    // Trova l'utente con l'username specificato e restituiscilo
    const datiUtenti = fs.readFileSync(path.join(__dirname, 'users.json'));
    const utenti = JSON.parse(datiUtenti);
    const user = utenti.find((u) => u.username === username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utente non trovato.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento dell\'utente.' });
  }
});

app.get('/api/channels', (req, res) => {
  try {
    const datiCanali = fs.readFileSync(path.join(__dirname, 'channels.json'));
    const canali = JSON.parse(datiCanali);
    res.json(canali);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento dei canali.' });
  }
});

// Aggiunta della gestione dell'endpoint PUT /api/users/:username e PUT /api/posts/:id/destinatari
app.put('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const updatedUserData = req.body;

  try {
    // Carica tutti gli utenti dal file JSON
    let datiUtenti = fs.readFileSync(path.join(__dirname, 'users.json'));
    let utenti = JSON.parse(datiUtenti);

    // Trova l'utente con l'username specificato
    const userIndex = utenti.findIndex((u) => u.username === username);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    // Aggiorna i dati dell'utente
    utenti[userIndex] = { ...utenti[userIndex], ...updatedUserData };

    // Sovrascrivi il file dei dati degli utenti con i nuovi dati
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(utenti, null, 2));

    res.status(200).json({ message: 'Dati utente aggiornati con successo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento dei dati utente.' });
  }
});

app.put('/api/posts/:id/destinatari', (req, res) => {
  const postId = req.params.id;
  const { destinatari } = req.body;

  try {
    let datiPosts = fs.readFileSync(path.join(__dirname, 'squeals.json'));
    let posts = JSON.parse(datiPosts);

    // Trova il post con l'ID corrispondente
    const postToUpdate = posts.find((post) => post.id === parseInt(postId));

    if (!postToUpdate) {
      return res.status(404).json({ message: 'Post non trovato.' });
    }

    // Aggiorna i destinatari del post
    postToUpdate.destinatari = destinatari;

    // Sovrascrivi il file dei post con i nuovi dati
    fs.writeFileSync(path.join(__dirname, 'squeals.json'), JSON.stringify(posts, null, 2));

    res.status(200).json({ message: 'Destinatari del post aggiornati con successo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento dei destinatari del post.' });
  }
});