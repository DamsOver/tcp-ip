// Work in progress...

/**
 * @author Auversack Damien
 * @date 23-09-2021
*/

function question1() {
    let tmp = document.getElementsByClassName("inputTextQ1");
    let ip = tmp[0].value;
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

    let networkAddress=findNetwork(ip,mask);
    let networkString = networkAddress.join('.')
    let broadcastAddress=findBroadcast(ip,mask);
    let broadcastString = broadcastAddress.join('.')

    let reponse="Adresse de réseau : "+networkString+", Adresse de broadcast : "+broadcastString;

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

// Renvoi true si l'ip est valide
function isValidIp(ip) {
    return true;
}

// Renvoi true si le masque est valide
function isValidMask() {
    return true;
}

// 1. Détermine la classe à laquelle appartient une adresse IP si on travaille en mode classfull
function classOfIpClassfull(ip) {
    if(!isValidIp(ip)) {
        return "Incorrect";
    }
    const ipArray = ip.split('.');
    let firstByteBinary = parseInt(ipArray[0], 10).toString(2).padStart(8, "0");
    for (let i = 0; i < 4; i++) {
        if(firstByteBinary.charAt(i)==='0') {
            switch(i) {
                case 0: return "A";
                case 1: return "B";
                case 2: return "C";
                case 3: return "D";
                default: break;
            }
        }
    }
    return "E";
}
// Détermine le nombre de réseaux que peut fournir un réseau de cette classe
function nbNetworkOfClass(classLetter) {
    switch(classLetter) {
        case 'A': return 126;
        case 'B': return 16_384;
        case 'C': return 2_097_152;
        case 'D': return -1;
        case 'E': return -2;
        default: return -3;
    }
}
// Détermine le nombre d’hôtes que peut fournir un réseau de cette classe
function nbHostOfClass(classLetter) {
    switch(classLetter) {
        case 'A': return 16_777_214;
        case 'B': return 65_534;
        case 'C': return 254;
        case 'D': return -1;
        case 'E': return -2;
        default: return -3;
    }
}

// 2. Détermine l’adresse de réseau et l’adresse de broadcast du réseau
//      Si il y a un sous-réseau, déterminer son adresse
function findNetwork(ip, mask) {
    return andOperationIpMask(ip, mask, false);
}

function findBroadcast(ip, mask) {
    return andOperationIpMask(ip, mask, true);
}

// 3. Détermine si l’IP appartient au réseau ou pas
function isIpPartOfSubNet(ip, mask, network) {
    return true;
}

// 4. Détermine si l’IP peut être attribuées aux machines de ce réseau
function isAvailableIp(ip, mask, network) {
    return true;
}

// 5. Détermine si chaque machine considère l’autre comme faisant partie de son réseau ou pas.
function isSameNetwork(net1, mask1, net2, mask2) {
    return true; // maybe 2 boolean to return
}

function convertDecimalToBinary(ipOrMask, isAnArray) {
    let ipOrMaskArray;
    if(!isAnArray){
        ipOrMaskArray = convertToArray(ipOrMask);
    } else {
        ipOrMaskArray = ipOrMask;
    }
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 10).toString(2).padStart(8, "0"));
    }
    return ipOrMaskArrayBinary;
}

function convertBinaryToDecimal(ipOrMask, isAnArray) {
    let ipOrMaskArray;
    if(!isAnArray){
        ipOrMaskArray = convertToArray(ipOrMask);
    } else {
        ipOrMaskArray = ipOrMask;
    }

    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 2).toString(10));
    }
    return ipOrMaskArrayBinary;
}

function convertToArray(ipOrMask) {
    const ipOrMaskArray = ipOrMask.split('.');
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i]))
    }
    return ipOrMaskArrayBinary;
}

function andOperationIpMask(ip, mask,isForBroadcast) {
    let ipBinary = convertDecimalToBinary(ip, false);
    let maskBinary = convertDecimalToBinary(mask, false);

    let ipOfNetwork;
    let ipOfNetworkArray = [];

    for(let i in ipBinary) {
        ipOfNetwork = "";
        for (let j in ipBinary[i]) {
            let tmpIp = ipBinary[i][j];
            let tmpMask = maskBinary[i][j];
            ipOfNetwork += (isForBroadcast && tmpMask==='0') ? 1 : parseInt(tmpIp)&&parseInt(tmpMask);
        }
        ipOfNetworkArray.push(ipOfNetwork);
    }
    return convertBinaryToDecimal(ipOfNetworkArray, true);
}