const obj = {esito: "OK"};
objJSON = JSON.stringify(obj);
console.log(objJSON instanceof Object);
let newObj = JSON.parse(objJSON);
console.log(newObj instanceof Object);