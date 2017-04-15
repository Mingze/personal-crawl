var json = require('./city_reference.json');
console.log(json["75011"]);
var string = "éèaçà";
var condition1 = string.replace(/@([\wàâäéèëêìîïôöòùûüç\-_]+):(\((.*?)\)|.[^ ]*)/g, '$1'); // take the Entity name`
console.log(condition1);
var new_json = {};
accentsTidy = function(s){
    var r=s.toLowerCase();
    r = r.replace(new RegExp("\\s", 'g'),"");
    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
    r = r.replace(new RegExp("æ", 'g'),"ae");
    r = r.replace(new RegExp("ç", 'g'),"c");
    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
    r = r.replace(new RegExp("ñ", 'g'),"n");                            
    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
    r = r.replace(new RegExp("œ", 'g'),"oe");
    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
    r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
    r = r.replace(new RegExp("\\W", 'g'),"");
    return r;
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

                // console.log(accentsTidy(string));
Object.keys(json).forEach(function(key) {
 console.log(key +":" +json[key]);
 if(key & key.length > 4){
 	new_json[key] = json[key];
 }
});
console.log(new_json);
// console.log(getKeyByValue(json, "Creteil"));