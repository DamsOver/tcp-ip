// Work in progress...

/**
 * @author Auversack Damien
 * @date 03-10-2021
 */

let regexIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
class Ip {
    ipAddress;
    constructor(ip) {
        this.setIp(ip);
    }
    setIp(ip) {
        this.ipAddress = ip;
    }
    isValidIp() {
        return regexIP.test(this.ipAddress);
    }
    getClassOfIpClassfull() {
        const ipArray = this.ipAddress.split('.');
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
    getNbNetworkOfClass() {
        const classLetter = this.getClassOfIpClassfull();
        switch(classLetter) {
            case 'A': return 126;
            case 'B': return 16_384;
            case 'C': return 2_097_152;
            case 'D': return -1;
            case 'E': return -2;
            default: return -3;
        }
    }
    getNbHostOfClass() {
        const classLetter = this.getClassOfIpClassfull();
        switch(classLetter) {
            case 'A': return 16_777_214;
            case 'B': return 65_534;
            case 'C': return 254;
            case 'D': return -1;
            case 'E': return -2;
            default: return -3;
        }
    }
}

class Mask {
    maskAddress;
    constructor(mask="") {
        this.setMask(mask);
    }
    setMask(mask) {
        this.maskAddress = Mask.isCidrMask(mask) ? Mask.convertMaskCidrToClassic(mask) : mask;
    }
    isValidMask() {
        let mask = this.maskAddress;
        let regex;
        if(Mask.isCidrMask()) {
            mask = mask.replace(/^\//, "");
            regex = /^([1-9]|[1-2][0-9]|3[0-2])$/;
        } else {
            regex = regexIP;
        }
        return regex.test(mask);
    }
    static isCidrMask(mask) {
        return mask.charAt(0)==='/';
    }
    reverseMask() {
        let maskArray = Network.convertIpMaskDecimalToBinary(this.maskAddress);
        maskArray = Network.convertIpMaskArrayToString(maskArray).replace(/\./g, '');
        let tmpArray = [];
        for (let i = 0; i < maskArray.length; i++) {
            tmpArray.push( (maskArray[i]===0 || maskArray[i]==='0') >>> 0);
        }
        return Network.convertIpMaskBinaryToDecimal( Network.splitStringIntoPartOfNCharacter(tmpArray.join(''),8) );
    }
    static convertMaskCidrToClassic(maskCidr) {
        maskCidr = maskCidr.replace(/^\//, "");
        let tmpMask = ''.padStart(maskCidr, "1").padEnd(32, "0");
        let maskClassic = Network.splitStringIntoPartOfNCharacter(tmpMask,8);
        return Network.convertIpMaskArrayToString( Network.convertIpMaskBinaryToDecimal(maskClassic) );
    }
    static convertMaskClassicToCidr(maskClassic) {
        let MaskArray = (!Array.isArray(maskClassic)) ? Network.convertIpMaskStringToArray(maskClassic) : maskClassic;
        let cidr = 0;
        for(let i in MaskArray) {
            let tmp = (parseInt(MaskArray[i]).toString(2)).match(/1/g) || []
            cidr += tmp.length;
        }
        return cidr;
    }
}

class Network {
    ip;
    mask;
    constructor(ip,mask) {
        this.ip = new Ip(ip);
        this.mask = new Mask(mask);
    }
    getNetworkAddress() {
        return this.andOrOperationIpMask(true).join(".");
    }
    getBroadcastAddress() {
        return this.andOrOperationIpMask(false).join(".");
    }
    andOrOperationIpMask(isAndOperation) {
        let ip = this.ip.ipAddress;
        let mask = (isAndOperation) ? this.mask.maskAddress : this.mask.reverseMask();

        let ipArray = (!Array.isArray(ip)) ? Network.convertIpMaskStringToArray(ip) : ip;
        let maskArray = (!Array.isArray(mask)) ? Network.convertIpMaskStringToArray(mask) : mask;

        let tmpArray = [];
        for (let i = 0; i < ipArray.length; i++) {
            tmpArray.push( (isAndOperation) ? (ipArray[i]&maskArray[i]).toString() : (ipArray[i]|maskArray[i]).toString() );
        }

        return tmpArray;
    }
    // 5. Détermine si chaque machine considère l’autre comme faisant partie de son réseau ou pas.
    isSameNetwork(network2) {
        let network1 = new Network(this.ip.ipAddress,this.mask.maskAddress);
        return network1.getNetworkAddress() === network2.getNetworkAddress();
    }
    static convertIpMaskDecimalToBinary(ipOrMask) {
        let ipOrMaskArray = (!Array.isArray(ipOrMask)) ? Network.convertIpMaskStringToArray(ipOrMask) : ipOrMask;
        let ipOrMaskArrayBinary=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 10).toString(2).padStart(8, "0"));
        }
        return ipOrMaskArrayBinary;
    }
    static convertIpMaskBinaryToDecimal(ipOrMask) {
        let ipOrMaskArray=(!Array.isArray(ipOrMask)) ? Network.convertIpMaskStringToArray(ipOrMask) : ipOrMask;
        let ipOrMaskArrayDecimal=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayDecimal.push(parseInt(ipOrMaskArray[i], 2).toString(10));
        }
        return ipOrMaskArrayDecimal;
    }
    static convertIpMaskStringToArray(ipOrMask) {
        const ipOrMaskArray = ipOrMask.split('.');
        let ipOrMaskArrayBinary=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayBinary.push(ipOrMaskArray[i]);
        }
        return ipOrMaskArrayBinary;
    }
    static convertIpMaskArrayToString(array) {
        return array.join('.');
    }
    static splitStringIntoPartOfNCharacter(str, n) {
        let regex = new RegExp(".{1,"+n+"}","g");
        return str.match(regex);
    }
}

// Questions
function question1() {
    let ipInputTxt = document.getElementsByClassName("inputTextQ1")[0].value;
    let ip = new Ip(ipInputTxt);

    if( !ip.isValidIp() ) { console.log("Invalide IP !"); return; }

    let classe = ip.getClassOfIpClassfull();
    let nbNetwork = ip.getNbNetworkOfClass();
    let nbHost = ip.getNbHostOfClass();

    let reponse = "Classe : "+classe+", Network : "+nbNetwork+", Host : "+nbHost;
    console.log("Question 1 : "+reponse);
}
// manque  Si une découpe
// en sous-réseau est réalisée, le programme doit déterminer l’adresse de SR
function question2() {
    let ipMaskInputTxt = document.getElementsByClassName("inputTextQ2");
    let ip = ipMaskInputTxt[0].value;
    let mask = ipMaskInputTxt[1].value;

    let network = new Network(ip,mask);

    let networkAddress = network.getNetworkAddress();
    let broadcastAddress = network.getBroadcastAddress();

    let reponse="Adresse de réseau : "+networkAddress+", Adresse de broadcast : "+broadcastAddress;

    console.log("Question 2 : "+reponse);
}
function question3() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputTextQ3");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    let reponse="";

    console.log("Question 3 : "+reponse);
}
function question4() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputTextQ4");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    let reponse="";

    console.log("Question 4 : "+reponse);
}
function question5() {
    let ipMaskInputTxt = document.getElementsByClassName("inputTextQ5");
    let ip1 = ipMaskInputTxt[0].value;
    let mask1 = ipMaskInputTxt[1].value;
    let ip2 = ipMaskInputTxt[2].value;
    let mask2 = ipMaskInputTxt[3].value;

    let network1 = new Network(ip1,mask1);
    let network2 = new Network(ip2,mask2);

    let reponse=(network1.isSameNetwork(network2))?"Les 2 réseaux sont identiques":"Les 2 réseaux sont différents";

    console.log("Question 5 : "+reponse);
}

//Si il y a un sous-réseau, déterminer son adresse
function isThereSubnetwork() {
    return true;
}
function findSubnetwork(ip, mask) {
    return "";
}
// 3. Détermine si l’IP appartient au réseau ou pas
function isIpPartOfSubnetwork(ip, mask, network) {
    return true;
}
// 4. Détermine si l’IP peut être attribuées aux machines de ce réseau
function isAvailableIp(ip, mask, network) {
    return true;
}