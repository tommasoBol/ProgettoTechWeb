express = require("express")
fs = require("fs");
fsProm = require("fs/promises");
bodyParser = require("body-parser");
cors = require("cors");
require("dotenv").config();
multer = require('multer');
path = require("path");


app = express()

app.use(cors());
app.use(bodyParser.json());
app.use('/files', express.static('files'));
const middle = express.urlencoded({
    extended : false,
    limit: 10000
})

let usersJSON = [];
let postsJSON = [];
let channelsJSON = [];
let uniqueId;

const upload = multer({ dest: "files/" });




function includeId(lista, idDaTrovare) {
    let index = 0;
    for (index in lista) {
        if (lista[index].id==idDaTrovare) {
            return index;
        }
    }
    return null;
}

function includeUsername(lista, userDaTrovare) {
    let index = 0;
    for (index in lista) {
        if (lista[index].username==userDaTrovare) {
            return index;
        }
    }
    return null;
}


function includeNoParam(lista, iscrizione) {
    let index = 0;
    for (index in lista) {
        if (lista[index]==iscrizione) {
            return index;
        }
    }
    return null;
}

function checkCredentials(username, password) {
    let index = 0;
    for (index in usersJSON) {
        if (usersJSON[index].username==username && usersJSON[index].password==password) {
            return usersJSON[index];
        }
    }
    return null;
}


setInterval(async() => {
    await fsProm.writeFile("./users.json", JSON.stringify(usersJSON, null, 4));
    await fsProm.writeFile("./posts.json", JSON.stringify(postsJSON, null, 4));
    console.log("scritto");
}, 12000);




app.post("/login", function(req, res) {
    const usrnm = req.body.username;
    const psswd = req.body.password;
    let account = checkCredentials(usrnm, psswd);
    if (account) {
        res.status(200).json({messaggio: "Autenticato", username: account.username});
    } else {
        res.status(400).json("Username o password non validi");
    }
})


app.get("/:username/posts", function(req,res) {
    const usrnm = req.params.username;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    let skipData = [];
    let iscrizioni = [];
    let postPerUtente = [];

    let flag = includeUsername(usersJSON, usrnm);
    if (flag) {
        iscrizioni = [...usersJSON[flag].iscrizioni];
    }
    
    let index = 0;
    for (index in postsJSON) {
        if (postsJSON[index].destinatari[0]=="TUTTI") { // il post è pubblico
            postPerUtente.push(postsJSON[index]);
        } else {
            let flag = includeNoParam(postsJSON[index].destinatari, usrnm);
            let flag1 = null;
            let i = 0;
            for (i in iscrizioni) {
                if (includeNoParam(postsJSON[index].destinatari, iscrizioni[i])) {
                    flag1 = true;
                }
            } 
            if (flag || flag1) {
                postPerUtente.push(postsJSON[index]);
            }
        }
    }

    let i;
    let j = (postPerUtente.length-limit-skip>=0) ? (postPerUtente.length-limit-skip) : 0;
    if (skip<=postPerUtente.length) {
        for (i=postPerUtente.length-1-skip;i>=j;i--) {
            skipData.push(postPerUtente[i]);
        }
    }
    //console.log(skipData);
    res.status(200).json(skipData); 
})

app.get("/photo", (req, res) => {
    const photo = 
    res.sendFile("be6ed04ec3ed1b9e80f88f4db4078349" , {root: path.join("./files")});
  })


app.post("/like", (req,res) => {
    const idSqueal = req.body.idSqueal;
    const usrnm = req.body.username;
    let wasDislike = false;
    let wasLike = false;

    let flag = includeId(postsJSON, idSqueal);   // arrays.includes+arrays.indexof
    if (flag) {
        if (includeNoParam(postsJSON[flag].rPos, usrnm)) {
            postsJSON[flag].rPos.splice(includeNoParam(postsJSON[flag].rPos, usrnm), 1);
            wasLike = true;
            res.status(200).json({messaggio:"Like", wasdislike: wasDislike, waslike: wasLike});    
            return; 
        } else if (includeNoParam(postsJSON[flag].rNeg, usrnm)) {
            postsJSON[flag].rNeg.splice(includeNoParam(postsJSON[flag].rNeg, usrnm), 1);
            wasDislike = true;
            postsJSON[flag].rPos.push(usrnm); 
            res.status(200).json({messaggio:"Like", wasdislike: wasDislike, waslike: wasLike});    
            return;
        }
        postsJSON[flag].rPos.push(usrnm); 
        res.status(200).json({messaggio:"Like", wasdislike: wasDislike, waslike: wasLike});
        return;
    } else {
        res.status(400).json({messaggio: "Azione non riuscita"});
    }

    /*for (index in postsJSON) {
        if (postsJSON[index].id==idSqueal) {
            for (index2 in postsJSON[index].rPos) {
                if (postsJSON[index].rPos[index2]==idUser) {  // ho gia messo like
                    res.status(400).json({messaggio: "Azione non riuscita"});    
                    return;            
                }
            }
            for (index3 in postsJSON[index].rNeg) {  // ho messo dislike e adesso voglio mettere like
                if (postsJSON[index].rNeg[index3]==idUser) {
                    postsJSON[index].rNeg.splice(index3, 1);
                    wasDislike = true;
                }
            }
            postsJSON[index].rPos.push(idUser); 
            res.status(200).json({messaggio:"Like", pre: wasDislike});
            return;
        }
    }
    res.status(400).json({messaggio: "Azione non riuscita"});*/
})

app.post("/dislike", (req,res) => {
    const idSqueal = req.body.idSqueal;
    const usrnm = req.body.username;
    let wasLike = false;
    let wasDislike = false;

    let flag = includeId(postsJSON, idSqueal);   // arrays.includes+arrays.indexof
    if (flag) {
        if (includeNoParam(postsJSON[flag].rNeg, usrnm)) {
            postsJSON[flag].rNeg.splice(includeNoParam(postsJSON[flag].rNeg, usrnm), 1);
            wasDislike = true;
            res.status(200).json({messaggio:"Dislike", wasdislike: wasDislike, waslike: wasLike});    
            return; 
        } else if (includeNoParam(postsJSON[flag].rPos, usrnm)) {
            postsJSON[flag].rPos.splice(includeNoParam(postsJSON[flag].rPos, usrnm), 1);
            wasLike = true;
            postsJSON[flag].rNeg.push(usrnm);
            res.status(200).json({messaggio:"Dislike", wasdislike: wasDislike, waslike: wasLike});  
            return;  
        }
        postsJSON[flag].rNeg.push(usrnm); 
        res.status(200).json({messaggio:"Dislike", waslike: wasLike, wasdislike: wasDislike});
        return;
    } else {
        res.status(400).json({messaggio: "Azione non riuscita"});
    }



    /*for (index in postsJSON) {
        if (postsJSON[index].id==idSqueal) {
            for (index2 in postsJSON[index].rNeg) {
                if (postsJSON[index].rNeg[index2]==idUser) {
                    res.status(400).json({messaggio: "Azione non riuscita"});
                    return;                
                }
            }
            for (index3 in postsJSON[index].rPos) {  // ho messo like e adesso voglio mettere dislike
                if (postsJSON[index].rPos[index3]==idUser) {
                    postsJSON[index].rPos.splice(index3, 1);
                    wasLike = true;
                }
            }
            postsJSON[index].rNeg.push(idUser);
            res.status(200).json({messaggio:"Dislike", pre:wasLike});
            return;
        }
    }
    res.status(400).json({messaggio: "Azione non riuscita"});*/
})



/*app.post("/squealing", (req, res) => { //aggiungere controllo sul destinatario e quota caratteri
    let aut = req.body.autore;
    let dests = req.body.destinatari;
    let realDests = [];
    let index = 0;
    for (index in dests) {
        realDests.push(dests[index].value);
    }
    let corpo = req.body.corpo;
    console.log(corpo);
    
    let newSqueal = {
        id: uniqueId+1,
        autore: aut,
        destinatari: realDests,
        corpo: corpo,
        rPos: [],
        rNeg: [],
        commenti: [],
        categoria: "",
        canaliRedazione: [],
        visualizzazioni: []
    };
    uniqueId++;
    postsJSON.push(newSqueal);
    console.log(postsJSON[postsJSON.length-1]);
    res.status(200).json({message:"ok"});
})*/


app.post('/squealing', upload.any(), function (req, res) {
    const reqBody = req.body;
    const autore = reqBody.autore;
    const destinatari = reqBody.destinatari.split(",");
    const file = req.files[0];
    console.log(file);
    let nomeFile = (file) ? file.filename : ""; 
    console.log(reqBody);
    let corpo = (reqBody.testo) ? reqBody.testo : "";
    console.log("destinatari: " + destinatari);
    let newSqueal = {
        id: uniqueId+1,
        autore: autore,
        destinatari: destinatari,
        corpo: corpo,
        nomeImmagine: nomeFile,
        rPos: [],
        rNeg: [],
        commenti: [],
        categoria: "",
        canaliRedazione: [],
        visualizzazioni: []
    };
    uniqueId++;
    postsJSON.push(newSqueal);
    console.log(postsJSON[postsJSON.length-1]);
    res.status(200).json({messaggio: "Squeal caricato correttamente"});
  })



    


app.post('/registrazione', async(req, res) => {

    const { username, password } = req.body;
    console.log(usersJSON);
  
    // Esegui ulteriori controlli di validazione sui dati
  
    // Crea un oggetto con i dati dell'utente
    const nuovoUtente = {
        id: usersJSON.length,
        username: username,
        password: password
    };

    for (i in  usersJSON) {
        if (usersJSON[i].username== nuovoUtente.username) {
            res.status(400).json("Username già in uso");
            return;
        }
    }
    try {
        usersJSON.push(nuovoUtente);
        await fsProm.writeFile("users.json", JSON.stringify(usersJSON, null, 4));
        res.status(201).json({ message: 'Registrazione avvenuta con successo!' });
    } catch(err) {
        res.status(500).json({message: "Registrazione fallita!"});
    }
  });


  app.get("/:userID/users", (req,res) => {
    let userID = req.params.userID;
    let daInviare = [];
    for (index in usersJSON) {
        if (usersJSON[index].username==userID) {
            continue;
        } else {
            daInviare.push(usersJSON[index].username);
        }
    }
    res.status(200).json(daInviare);
  })

  app.get("/:userID/canali", (req,res)=> {
    let userID = req.params.userID;
    let daInviare = [];
    for (index in usersJSON) {
        if (usersJSON[index].username==userID) {
            for (index2 in usersJSON[index].iscrizioni) {
                daInviare.push(usersJSON[index].iscrizioni[index2]);
            }
        }
    }
    res.status(200).json(daInviare);
  });


  app.post("/visualized", (req,res)=> {
    const idSqueal = req.body.idSqueal;
    const idUser = req.body.idUser;
    for (index in postsJSON) {
        if (postsJSON[index].id==idSqueal) {
            for (index2 in postsJSON[index].visualizzazioni) {
                if (postsJSON[index].visualizzazioni[index2]==idUser) {
                    res.status(200).json({message: "Gia visualizzato"});
                    return;
                }
            }
            postsJSON[index].visualizzazioni.push(idUser);
            res.status(200).json({messaggio: "Visualizzato"});
            return;
        }
    }
  })


  app.post("/commenta", (req, res) => {
    const idSqueal = req.body.idSqueal;
    const usrnm =req.body.idUser;
    const commento = req.body.commento;
    const data = req.body.data;
    let flag = includeId(postsJSON, idSqueal);
    let flag1 = includeUsername(usersJSON, usrnm);
    if (flag && flag1) {
        let index = 0;
        let nuovoCommento = {autore: usrnm, messaggio: commento, data: data};
        if ((includeNoParam(postsJSON[flag].destinatari, "TUTTI")) || (includeNoParam(postsJSON[flag].destinatari, usrnm))) {
            postsJSON[flag].commenti.push(nuovoCommento);
            res.status(200).json({message: "Commento scritto correttamente"});
            return;
        } else {
            for (index in usersJSON[flag1].iscrizioni) {
                if (includeNoParam(postsJSON[flag].destinatari, usersJSON[flag1].iscrizioni[index])) {
                    postsJSON[flag].commenti.push(nuovoCommento);
                    res.status(200).json({message: "Commento scritto correttamente"});
                    return;
                }
            }
            res.status(401).json({message:"Non autorizzato"});
            return;    
        }
    } else {
        res.status(400).json({message:"Azione non eseguita"});
    }
  })

app.listen(8099, async function() {
    try {
        if (fs.existsSync("./users.json")) {
            let users = await fsProm.readFile("./users.json");
            usersJSON = JSON.parse(users);
        }
        if (fs.existsSync("./posts.json")) {
            let posts = await fsProm.readFile("./posts.json");
            postsJSON = JSON.parse(posts);
            let index = 0;
            for (index in postsJSON) {
                postsJSON[index].data = new Date();
            }
        }
        if (fs.existsSync("./channles.json")) {
            let channels = await fsProm.readFile("./channels.json");
            channelsJSON = JSON.parse(channels);
        }
        uniqueId = (postsJSON.length>0) ? postsJSON[postsJSON.length-1].id : 0;
        console.log("UniqueId: " + uniqueId);
        console.log("\nServer is running\n");
    } catch (err) {
        console.log(err);
        return;
    }
    
})