// Regex vérifiant la validité d'une Ip
let regexIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
let validMaskNumbers = [0, 128, 192, 224, 240, 248, 252, 254, 255];
class Ip {
    ipAddress;
    constructor(ip) {
        this.setIp(ip);
    }
    setIp(ip) {
        this.ipAddress = ip;
    }
    // Vérifie si l'ip est valide d'après un regex
    static isValidIp(ip) {
        let ipArray = Network.convertIpMaskStringToArray(ip);
        if(ipArray[0]==="127") {
            return false;
        }
        switch (ip) {
            case "0.0.0.0":
                return false;
            case "255.255.255.255":
                return false;
            default:
        }

        return regexIP.test(ip);
    }
    // Récupère la classe d'une ip en classfull
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
    // Récupère le nombre de réseaux d'une classe spécifique (mode classfull)
    getNbNetworkOfClass() {
        const classLetter = this.getClassOfIpClassfull();
        switch(classLetter) {
            case 'A': return 126;
            case 'B': return 16_384;
            case 'C': return 2_097_152;
            case 'D': return 0;
            case 'E': return 0;
            default: return 0;
        }
    }
    // Récupère le nombre d'hotes d'une classe spécifique (mode classfull)
    getNbHostOfClass() {
        const classLetter = this.getClassOfIpClassfull();
        switch(classLetter) {
            case 'A': return 16_777_214;
            case 'B': return 65_534;
            case 'C': return 254;
            case 'D': return 0;
            case 'E': return 0;
            default: return 0;
        }
    }

}

class Mask {
    maskAddress;
    constructor(mask="") {
        this.setMask(mask);
    }
    // Stoque toujours le masque en version classic et non CIDR
    setMask(mask) {
        this.maskAddress = Mask.isCidrMask(mask) ? Mask.convertMaskCidrToClassic(mask) : mask;
    }
    // Inverse les bits d'un masque
    reverseMask() {
        let maskArray = Network.convertIpMaskDecimalToBinary(this.maskAddress);
        maskArray = Network.convertIpMaskArrayToString(maskArray).replace(/\./g, '');
        let tmpArray = [];
        for (let i = 0; i < maskArray.length; i++) {
            tmpArray.push( (maskArray[i]===0 || maskArray[i]==='0') >>> 0);
        }
        return Network.convertIpMaskBinaryToDecimal( Network.splitStringIntoPartOfNCharacter(tmpArray.join(''),8) );
    }
    // Vérifie si le masque est valide d'après le regex de l'ip + CIDR
    static isValidMask(mask) {
        let regex;

        if(Mask.isCidrMask(mask)) {
            mask = mask.replace(/^\//, "");
            regex = /^([1-9]|[1-2][0-9]|30)$/;
            return regex.test(mask);
        }
        else {

            let isValid = false;
            let currentNumber = 0;
            let isLastNumber = false;
            let maskList = mask.split(".");
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < validMaskNumbers.length; j++) {
                    if (Number(maskList[i]) === validMaskNumbers[j]) {
                        isValid = true;
                        currentNumber = validMaskNumbers[j];
                        if (isLastNumber === true && currentNumber !== 0) {
                            return false;
                        }
                        if (currentNumber !== 255) {
                            isLastNumber = true;
                        }

                    }
                }
                if(isValid === false){
                    return false;
                }
                isValid = false;
            }

            return true;
        }
    }
    // Vérifie si le masque est en notation CIDR
    static isCidrMask(mask) {
        return mask.charAt(0)==='/';
    }
    // Converti un masque CIDR en masque classic
    static convertMaskCidrToClassic(maskCidr) {
        maskCidr = maskCidr.replace(/^\//, "");
        let tmpMask = ''.padStart(maskCidr, "1").padEnd(32, "0");
        let maskClassic = Network.splitStringIntoPartOfNCharacter(tmpMask,8);
        return Network.convertIpMaskArrayToString( Network.convertIpMaskBinaryToDecimal(maskClassic) );
    }
    // Converti un masque classic en masque CIDR
    static convertMaskClassicToCidr(maskClassic) {
        let MaskArray = (!Array.isArray(maskClassic)) ? Network.convertIpMaskStringToArray(maskClassic) : maskClassic;
        let cidr = 0;
        for(let i in MaskArray) {
            let tmp = (parseInt(MaskArray[i]).toString(2)).match(/1/g) || []
            cidr += tmp.length;
        }
        return cidr;
    }
    // Récupère le masque d'une classe d'ip (mode classfull)
    static getMaskOfClassful(classLetter) {
        switch(classLetter) {
            case 'A': return "255.0.0.0";
            case 'B': return "255.255.0.0";
            case 'C': return "255.255.255.0";
            case 'D': return -1;
            case 'E': return "/24";
            default: return -3;
        }
    }

    static getClassOfCidrMask(maskCidr) {

        if(!Mask.isValidMask(maskCidr)) {
            return "-1";
        }

        if(!Mask.isCidrMask(maskCidr)) {
            maskCidr = Mask.convertMaskClassicToCidr(maskCidr)
        }

        maskCidr = maskCidr.replace(/^\//, "");

        let intMaskCidr = parseInt(maskCidr);

        if(intMaskCidr>=0 && intMaskCidr<=7) {
            return "-1";
        } else if(intMaskCidr>=8 && intMaskCidr<=15) {
            return "A";
        } else if(intMaskCidr>=16 && intMaskCidr<=23) {
            return "B";
        } else if(intMaskCidr>=24 && intMaskCidr<=32) {
            return "C";
        }

    }

}

class Network {
    ip;
    mask;
    constructor(ip,mask) {
        this.ip = new Ip(ip);
        this.mask = new Mask(mask);
    }
    // Récupère l'adresse réseau d'une IP à l'aide de son masque
    getNetworkAddress() {
        return this.andOrOperationIpMask(true).join(".");
    }
    // Récupère l'adresse de broadcast d'une IP à l'aide de son masque
    getBroadcastAddress() {
        return this.andOrOperationIpMask(false).join(".");
    }
    // Si "isAndOperation" vaut true alors : Effectue un ET logique entre une IP et son masque
    // Si "isAndOperation" vaut false alors : Effectue un OU logique entre une IP et son masque
    andOrOperationIpMask(isAndOperation) {
        let ip = this.ip.ipAddress;
        let mask = (isAndOperation) ? this.mask.maskAddress : this.mask.reverseMask();
        let ipArray = (!Array.isArray(ip)) ? Network.convertIpMaskStringToArray(ip) : ip;
        let maskArray = (!Array.isArray(mask)) ? Network.convertIpMaskStringToArray(mask) : mask;
        let tmpArray = [];
        for (let i = 0; i < ipArray.length; i++) {
            tmpArray.push( (isAndOperation)
                ? (ipArray[i]&maskArray[i]).toString() : (ipArray[i]|maskArray[i]).toString() );
        }
        return tmpArray;
    }
    // Récupère l'adresse de sous-réseau ainsi que l'adresse de broadcast du réseau dans le cas où un sous-réseau existe
    getSubnetworkAddress(mask, isForBroadcast, isForActualSubnet) {
        let networkAddress = this.getNetworkAddress();
        networkAddress = Network.convertIpMaskStringToArray(networkAddress);
        let step = (isForBroadcast) ? Network.calculateTheStep(mask)-1 : Network.calculateTheStep(mask);

        let tmpNetworkAddress;
        let classLetter = this.ip.getClassOfIpClassfull();

        switch(classLetter) {
            case 'A':
                tmpNetworkAddress = (isForActualSubnet) ? parseInt(networkAddress[1]) : parseInt(networkAddress[1]) + step;
                networkAddress[1] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'B':
                tmpNetworkAddress = (isForActualSubnet) ? parseInt(networkAddress[2]) : parseInt(networkAddress[2]) + step;
                networkAddress[2] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'C':
                tmpNetworkAddress = (isForActualSubnet) ? parseInt(networkAddress[3]) : parseInt(networkAddress[3]) + step;
                networkAddress[3] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'D': return -1;
            case 'E': return -2;
            default: return -3;
        }


    }
    // Vérifie si 2 IP font partient du même réseau
    isSameNetwork(network2) {
        let network1 = new Network(this.ip.ipAddress,this.mask.maskAddress);
        return network1.getNetworkAddress() === network2.getNetworkAddress();
    }
    // Vérifie si une Ip faut partie d'un adresse réseau
    isIpPartOfNetwork(networkAddress) {
        let network2 = new Network(networkAddress,"/32");
        return this.isSameNetwork(network2);
    }
    // Vérifie si une Ip peut être attribuée aux machines de ce réseau
    isValidIpForThisNetwork(networkAddress) {
        let network2 = new Network(networkAddress,"/32");

        let isNotNetworkAddressAnd = this.getNetworkAddress() !== this.ip.ipAddress;
        let isNotBroadcastAddress = this.getBroadcastAddress() !== this.ip.ipAddress;

        return this.isSameNetwork(network2) && isNotNetworkAddressAnd && isNotBroadcastAddress;
    }
    // En mode classfull, vérifie si une ip possède un sous-réseau
    isThereSubnetwork(classLetter) {
        let maskOfClassLetter = Mask.getMaskOfClassful(classLetter);
        let maskOfNetwork = this.mask.maskAddress;

        let nbOneInMask1 = Mask.convertMaskClassicToCidr(maskOfClassLetter);
        let nbOneInMask2 = Mask.convertMaskClassicToCidr(maskOfNetwork);

        return nbOneInMask2>nbOneInMask1;
    }
    // converti une ip ou un masque décimal en binaire
    static convertIpMaskDecimalToBinary(ipOrMask) {
        let ipOrMaskArray = (!Array.isArray(ipOrMask)) ? Network.convertIpMaskStringToArray(ipOrMask) : ipOrMask;
        let ipOrMaskArrayBinary=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 10).toString(2).padStart(8, "0"));
        }
        return ipOrMaskArrayBinary;
    }
    // converti une ip ou un masque binaire en décimal
    static convertIpMaskBinaryToDecimal(ipOrMask) {
        let ipOrMaskArray=(!Array.isArray(ipOrMask)) ? Network.convertIpMaskStringToArray(ipOrMask) : ipOrMask;
        let ipOrMaskArrayDecimal=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayDecimal.push(parseInt(ipOrMaskArray[i], 2).toString(10));
        }
        return ipOrMaskArrayDecimal;
    }
    // converti une ip ou un masque de type string en array
    static convertIpMaskStringToArray(ipOrMask) {
        const ipOrMaskArray = (!Array.isArray(ipOrMask)) ? ipOrMask.split('.') : ipOrMask;
        let ipOrMaskArrayBinary=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayBinary.push(ipOrMaskArray[i]);
        }
        return ipOrMaskArrayBinary;
    }
    // converti une ip ou un masque de type array en string
    static convertIpMaskArrayToString(array) {
        return (Array.isArray(array)) ? array.join('.') : array;
    }
    // Divise un string en part de n caractères
    static splitStringIntoPartOfNCharacter(str, n) {
        let regex = new RegExp(".{1,"+n+"}","g");
        return str.match(regex);
    }
    // Calcule le pas d'un réseau
    static calculateTheStep(mask) {
        if(Mask.isCidrMask(mask)) {
            mask = Mask.convertMaskCidrToClassic(mask)
        }
        let maskBinary = Network.convertIpMaskDecimalToBinary(mask);
        let maskArray = (!Array.isArray(maskBinary)) ? Network.convertIpMaskStringToArray(maskBinary) : maskBinary;
        for (const octet in maskArray) {
            let tmp = maskArray[octet].split('');
            if(tmp.indexOf('0') !== -1) {
                let pos = tmp.indexOf('0');
                return (pos !== 0) ? Math.pow(2,8-pos) : 1;
            }
        }
        return 1;
    }

    static isValidLetterIpMaskClassful(letterIp, letterMask) {
        if(letterMask<letterIp) {
            return false;
        }
        return true;
    }

}

function removeAlertIfContains(answerQuestion) {
    if (answerQuestion.classList.contains('alert-warning')){
        answerQuestion.classList.remove('alert-warning');
    }
    if (answerQuestion.classList.contains('alert-success')){
        answerQuestion.classList.remove('alert-success');
    }
}

function isNotValidQuestion(condition, answerQuestion, message) {
    if( condition ) {
        answerQuestion.classList.add('alert-warning');
        answerQuestion.textContent=message;
        return true;
    }
    return false;
}

// Récupère les inputs de la question 1
function question1() {
    let ipInputTxt = document.getElementsByClassName("inputQ1")[0].value;
    let ip = new Ip(ipInputTxt);
    question1_Operations(ip);
}
// Logique de la question 1
function question1_Operations(ip) {
    let answerQ1 = document.getElementsByClassName("answerQ1")[0];

    removeAlertIfContains(answerQ1);

    let condition = !Ip.isValidIp(ip.ipAddress);
    if(isNotValidQuestion(condition, answerQ1,"Erreur dans l'IP !" )) {
        return;
    }

    let classIp = ip.getClassOfIpClassfull();
    let nbNetwork = ip.getNbNetworkOfClass();
    let nbHost = ip.getNbHostOfClass();
    let answer = "Classe : "+classIp+", Network : "+nbNetwork+", Host : "+nbHost;
    console.log("Question 1 : "+answer);
    answerQ1.classList.add('alert-success')
    answerQ1.textContent=answer;
}

// Récupère les inputs de la question 2
function question2() {
    let ipMaskInputTxt = document.getElementsByClassName("inputQ2");
    let ip = ipMaskInputTxt[0].value;
    let mask = ipMaskInputTxt[1].value;
    let isClassful = ipMaskInputTxt[2].checked;
    question2_Operations(ip,mask,isClassful);
}
// Logique de la question 2
function question2_Operations(ip,mask,isClassful) {
    let answerQ2 = document.getElementsByClassName("answerQ2")[0];

    removeAlertIfContains(answerQ2);

    let condition = !Mask.isValidMask(mask) || !Ip.isValidIp(ip);
    if(isNotValidQuestion(condition, answerQ2,"Erreur dans le masque ou l'IP !" )) {
        return;
    }

    let network = new Network(ip,mask);
    let classLetter = network.ip.getClassOfIpClassfull();
    let networkAddress = network.getNetworkAddress();
    let broadcastAddress = network.getBroadcastAddress();

    let answer;

    if(isClassful) {

        let maskClassful = Mask.getMaskOfClassful(classLetter);
        let networkClassful = new Network(ip,maskClassful);
        let networkAddressClassful = networkClassful.getNetworkAddress();

        let broadcastAddressClassful = networkClassful.getBroadcastAddress();
        let subnetworkAddress = network.getSubnetworkAddress(mask,false, true);
        let broadcastAddressClassfulWithsubnetwork = network.getSubnetworkAddress(mask,true, false);

        let letterOfIpClassFull = (new Ip(ip)).getClassOfIpClassfull()
        let letterOfMaskClassFull = Mask.getClassOfCidrMask(mask);

        let condition2 = Network.isValidLetterIpMaskClassful(letterOfIpClassFull, letterOfMaskClassFull);
        if(isNotValidQuestion(!condition2, answerQ2,"Erreur dans le masque ou l'IP !" )) {
            return;
        }

        answer = "Adresse de réseau : "+networkAddressClassful+", Adresse de broadcast : ";
        answer += (network.isThereSubnetwork(classLetter))
            ? broadcastAddressClassfulWithsubnetwork+", Adresse de sous-réseau : " + subnetworkAddress
            : broadcastAddressClassful;
    } else {
        answer = "Adresse de réseau : "+networkAddress+", Adresse de broadcast : "+broadcastAddress;
    }

    console.log("Question 2 : "+answer);
    answerQ2.classList.add('alert-success')
    answerQ2.textContent=answer;

}

// Récupère les inputs de la question 3
function question3() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputQ3");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    question3_Operations(ip,mask,networkAddress);
}
// Logique de la question 3
function question3_Operations(ip,mask,networkAddress) {
    let answerQ3 = document.getElementsByClassName("answerQ3")[0];

    removeAlertIfContains(answerQ3);

    let condition = !Mask.isValidMask(mask) || !Ip.isValidIp(ip) || !Ip.isValidIp(networkAddress);
    if(isNotValidQuestion(condition, answerQ3,"Erreur dans le masque, l'IP ou l'adresse de réseau !" )) {
        return;
    }

    let network = new Network(ip,mask);
    let answer = ( network.isIpPartOfNetwork(networkAddress) )
        ? "L'adresse IP appartient au réseau" : "L'adresse IP n'appartient pas au réseau";
    console.log("Question 3 : "+answer);
    answerQ3.classList.add('alert-success')
    answerQ3.textContent=answer;
}

// Récupère les inputs de la question 4
function question4() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputQ4");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    question4_Operations(ip,mask,networkAddress);
}
// Logique de la question 4
function question4_Operations(ip,mask,networkAddress) {
    let answerQ4 = document.getElementsByClassName("answerQ4")[0];

    removeAlertIfContains(answerQ4);

    let condition = !Mask.isValidMask(mask) || !Ip.isValidIp(ip) || !Ip.isValidIp(networkAddress);
    if(isNotValidQuestion(condition, answerQ4,"Erreur dans le masque, l'IP ou l'adresse de réseau !" )) {
        return;
    }

    let network = new Network(ip,mask);
    let answer =  (network.isValidIpForThisNetwork(networkAddress))
        ? "L'adresse IP peut être attribuée aux machines de ce réseau"
        : "L'adresse IP ne peut pas être attribuée aux machines de ce réseau";
    console.log("Question 4 : "+answer);
    answerQ4.classList.add('alert-success')
    answerQ4.textContent=answer;

}

// Récupère les inputs de la question 5
function question5() {
    let ipMaskInputTxt = document.getElementsByClassName("inputQ5");
    let ip1 = ipMaskInputTxt[0].value;
    let mask1 = ipMaskInputTxt[1].value;
    let ip2 = ipMaskInputTxt[2].value;
    let mask2 = ipMaskInputTxt[3].value;
    question5_Operations(ip1,mask1,ip2,mask2);
}
// Logique de la question 5
function question5_Operations(ip1,mask1,ip2,mask2) {
    let answerQ5 = document.getElementsByClassName("answerQ5")[0];

    removeAlertIfContains(answerQ5);

    let condition = !Mask.isValidMask(mask1) || !Ip.isValidIp(ip1) || !Mask.isValidMask(mask2) || !Ip.isValidIp(ip2);
    if(isNotValidQuestion(condition, answerQ5,"Erreur dans le masque ou l'IP !" )) {
        return;
    }

    let network1 = new Network(ip1,mask1);
    let network2 = new Network(ip2,mask2);
    let answer=(network1.isSameNetwork(network2))
        ?"Les 2 machines font parties du même réseau":"Les 2 machines ne font pas parties du même réseau";
    console.log("Question 5 : "+answer);
    answerQ5.classList.add('alert-success')
    answerQ5.textContent=answer;
}