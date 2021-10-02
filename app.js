// Work in progress...

/**
 * @author Auversack Damien
 * @date 02-10-2021
*/

function question1() {
    let tmp = document.getElementsByClassName("inputTextQ1");
    let ip = tmp[0].value;
    if(!isValidIp(ip)){console.log("Invalide IP !");return;}
    let classe = classOfIpClassfull(ip);
    let nbNetwork = nbNetworkOfClass(classe);
    let nbHost = nbHostOfClass(classe);
    let reponse = "Classe : "+classe+", Network : "+nbNetwork+", Host : "+nbHost;
    console.log("Question 1 : "+reponse);
}
// manque  Si une découpe
// en sous-réseau est réalisée, le programme doit déterminer l’adresse de SR
function question2() {
    let tmp = document.getElementsByClassName("inputTextQ2");
    let ip = tmp[0].value;
    let mask = tmp[1].value;
    if(mask.charAt(0)==='/') {
        mask = convertMaskCidrToClassic(mask);
    }

    let networkAddress=findNetwork(ip,mask).join('.');
    let broadcastAddress=findBroadcast(ip,mask).join('.');

    let reponse="Adresse de réseau : "+networkAddress+", Adresse de broadcast : "+broadcastAddress;

    console.log("Question 2 : "+reponse);
}
function question3() {
    let tmp = document.getElementsByClassName("inputTextQ3");
    let ip = tmp[0].value;
    let masque = tmp[1].value;
    let adresseReseau = tmp[2].value;
    let reponse="";

    console.log("Question 3 : "+reponse);
}
function question4() {
    let tmp = document.getElementsByClassName("inputTextQ4");
    let ip = tmp[0].value;
    let masque = tmp[1].value;
    let adresseReseau = tmp[2].value;
    let reponse="";

    console.log("Question 4 : "+reponse);
}
function question5() {
    let tmp = document.getElementsByClassName("inputTextQ5");
    let ip1 = tmp[0].value;
    let masque1 = tmp[1].value;
    let ip2 = tmp[2].value;
    let masque2 = tmp[3].value;
    let reponse="";

    console.log("Question 5 : "+reponse);
}