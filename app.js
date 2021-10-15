// Work in progress...

/**
 * @author Auversack Damien
 * @date 04-10-2021
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
    static isValidIp(ip) {
        return regexIP.test(ip);
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
    reverseMask() {
        let maskArray = Network.convertIpMaskDecimalToBinary(this.maskAddress);
        maskArray = Network.convertIpMaskArrayToString(maskArray).replace(/\./g, '');
        let tmpArray = [];
        for (let i = 0; i < maskArray.length; i++) {
            tmpArray.push( (maskArray[i]===0 || maskArray[i]==='0') >>> 0);
        }
        return Network.convertIpMaskBinaryToDecimal( Network.splitStringIntoPartOfNCharacter(tmpArray.join(''),8) );
    }
    static isValidMask(mask) {
        let regex;
        if(Mask.isCidrMask(mask)) {
            mask = mask.replace(/^\//, "");
            regex = /^([1-9]|[1-2][0-9]|30)$/;
        } else {
            regex = regexIP;
        }
        return regex.test(mask);
    }
    static isCidrMask(mask) {
        return mask.charAt(0)==='/';
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
    static getMaskOfClassful(classLetter) {
        switch(classLetter) {
            case 'A': return "255.0.0.0";
            case 'B': return "255.255.0.0";
            case 'C': return "255.255.255.0";
            case 'D': return -1;
            case 'E': return -2;
            default: return -3;
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
    getSubnetworkAddress(mask, isForBroadcast) {
        let networkAddress = this.getNetworkAddress();
        networkAddress = Network.convertIpMaskStringToArray(networkAddress);
        let step = (isForBroadcast) ? Network.calculateTheStep(mask)-1 : Network.calculateTheStep(mask);
        let tmpNetworkAddress;
        let classLetter = this.ip.getClassOfIpClassfull();

        switch(classLetter) {
            case 'A':
                tmpNetworkAddress = parseInt(networkAddress[1]) + step;
                networkAddress[1] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'B':
                tmpNetworkAddress = parseInt(networkAddress[2]) + step;
                networkAddress[2] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'C':
                tmpNetworkAddress = parseInt(networkAddress[3]) + step;
                networkAddress[3] = tmpNetworkAddress.toString();
                return Network.convertIpMaskArrayToString(networkAddress);
            case 'D': return -1;
            case 'E': return -2;
            default: return -3;
        }
    }
    isSameNetwork(network2) {
        let network1 = new Network(this.ip.ipAddress,this.mask.maskAddress);
        return network1.getNetworkAddress() === network2.getNetworkAddress();
    }
    isIpPartOfNetwork(networkAddress) {
        let network2 = new Network(networkAddress,"/32");
        return this.isSameNetwork(network2);
    }
    isValidIpForThisNetwork(networkAddress) {
        let network2 = new Network(networkAddress,"/32");

        let isNotNetworkAddressAnd = this.getNetworkAddress() !== this.ip.ipAddress;
        let isNotBroadcastAddress = this.getBroadcastAddress() !== this.ip.ipAddress;

        return this.isSameNetwork(network2) && isNotNetworkAddressAnd && isNotBroadcastAddress;
    }
    isThereSubnetwork(classLetter) {
        let maskOfClassLetter = Mask.getMaskOfClassful(classLetter);
        let maskOfNetwork = this.mask.maskAddress;

        let nbOneInMask1 = Mask.convertMaskClassicToCidr(maskOfClassLetter);
        let nbOneInMask2 = Mask.convertMaskClassicToCidr(maskOfNetwork);

        return nbOneInMask2>nbOneInMask1;
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
        const ipOrMaskArray = (!Array.isArray(ipOrMask)) ? ipOrMask.split('.') : ipOrMask;
        let ipOrMaskArrayBinary=[];
        for (let i in ipOrMaskArray) {
            ipOrMaskArrayBinary.push(ipOrMaskArray[i]);
        }
        return ipOrMaskArrayBinary;
    }
    static convertIpMaskArrayToString(array) {
        return (Array.isArray(array)) ? array.join('.') : array;
    }
    static splitStringIntoPartOfNCharacter(str, n) {
        let regex = new RegExp(".{1,"+n+"}","g");
        return str.match(regex);
    }
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

}

function question1() {
    let ipInputTxt = document.getElementsByClassName("inputQ1")[0].value;
    let ip = new Ip(ipInputTxt);
    question1_Operations(ip);
}
function question1_Operations(ip) {
    if ( document.getElementsByClassName("answerQ1")[0].classList.contains('alert-warning') ){
        document.getElementsByClassName("answerQ1")[0].classList.remove('alert-warning');
    }
    if ( document.getElementsByClassName("answerQ1")[0].classList.contains('alert-success') ){
        document.getElementsByClassName("answerQ1")[0].classList.remove('alert-success');
    }

    if( !Ip.isValidIp(ip.ipAddress) ) {
        console.log("Invalid IP !");
        document.getElementsByClassName("answerQ1")[0].classList.add('alert-warning');
        document.getElementsByClassName("answerQ1")[0].textContent="Invalid IP !";
        return; }
    let classIp = ip.getClassOfIpClassfull();
    let nbNetwork = ip.getNbNetworkOfClass();
    let nbHost = ip.getNbHostOfClass();
    let reponse = "Classe : "+classIp+", Network : "+nbNetwork+", Host : "+nbHost;
    console.log("Question 1 : "+reponse);
    document.getElementsByClassName("answerQ1")[0].classList.add('alert-success')
    document.getElementsByClassName("answerQ1")[0].textContent=reponse;

}
function question2() {
    let ipMaskInputTxt = document.getElementsByClassName("inputQ2");
    let ip = ipMaskInputTxt[0].value;
    let mask = ipMaskInputTxt[1].value;
    let isClassful = ipMaskInputTxt[2].checked;
    question2_Operations(ip,mask,isClassful);
}
function question2_Operations(ip,mask,isClassful) {
    if ( document.getElementsByClassName("answerQ2")[0].classList.contains('alert-warning') ){
        document.getElementsByClassName("answerQ2")[0].classList.remove('alert-warning');
    }
    if ( document.getElementsByClassName("answerQ2")[0].classList.contains('alert-success') ){
        document.getElementsByClassName("answerQ2")[0].classList.remove('alert-success');
    }
    if( !Mask.isValidMask(mask) | !Ip.isValidIp(ip)) {
        console.log("Invalid Mask or IP !");
        document.getElementsByClassName("answerQ2")[0].classList.add('alert-warning');
        document.getElementsByClassName("answerQ2")[0].textContent="Invalid Mask or IP !";
        return;
    }
    let network = new Network(ip,mask);
    let classLetter = network.ip.getClassOfIpClassfull();
    let networkAddress = network.getNetworkAddress();
    let broadcastAddress = network.getBroadcastAddress();

    let maskClassful = Mask.getMaskOfClassful(classLetter);
    let networkClassful = new Network(ip,maskClassful);
    let networkAddressClassful = networkClassful.getNetworkAddress();

    let broadcastAddressClassful = networkClassful.getBroadcastAddress();
    let subnetworkAddress = network.getSubnetworkAddress(mask,false);
    let broadcastAddressClassfulWithsubnetwork = network.getSubnetworkAddress(mask,true);

    let answer;

    if(isClassful) {
        answer = "Adresse de réseau : "+networkAddressClassful+", Adresse de broadcast : ";
        answer += (network.isThereSubnetwork(classLetter)) ? broadcastAddressClassfulWithsubnetwork+", Adresse de sous-réseau : "+ subnetworkAddress : broadcastAddressClassful;
    } else {
        answer = "Adresse de réseau : "+networkAddress+", Adresse de broadcast : "+broadcastAddress;
    }

    console.log("Question 2 : "+answer);
    document.getElementsByClassName("answerQ2")[0].classList.add('alert-success')
    document.getElementsByClassName("answerQ2")[0].textContent=answer;

}
function question3() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputQ3");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    question3_Operations(ip,mask,networkAddress);
}
function question3_Operations(ip,mask,networkAddress) {
    if ( document.getElementsByClassName("answerQ3")[0].classList.contains('alert-warning') ){
        document.getElementsByClassName("answerQ3")[0].classList.remove('alert-warning');
    }
    if ( document.getElementsByClassName("answerQ3")[0].classList.contains('alert-success') ){
        document.getElementsByClassName("answerQ3")[0].classList.remove('alert-success');
    }
    if( !Mask.isValidMask(mask) | !Ip.isValidIp(ip) | !Ip.isValidIp(networkAddress)) {
        console.log("Invalid Mask or IP !");
        document.getElementsByClassName("answerQ3")[0].classList.add('alert-warning');
        document.getElementsByClassName("answerQ3")[0].textContent="Invalid Mask or IP !";
        return;
    }
    let network = new Network(ip,mask);
    let answer = ( network.isIpPartOfNetwork(networkAddress) ) ? "L'adresse IP appartient au réseau" : "L'adresse IP n'appartient pas au réseau";
    console.log("Question 3 : "+answer);
    document.getElementsByClassName("answerQ3")[0].classList.add('alert-success')
    document.getElementsByClassName("answerQ3")[0].textContent=answer;

}
function question4() {
    let ipMaskNetworkInputTxt = document.getElementsByClassName("inputQ4");
    let ip = ipMaskNetworkInputTxt[0].value;
    let mask = ipMaskNetworkInputTxt[1].value;
    let networkAddress = ipMaskNetworkInputTxt[2].value;
    question4_Operations(ip,mask,networkAddress);
}
function question4_Operations(ip,mask,networkAddress) {
    if ( document.getElementsByClassName("answerQ4")[0].classList.contains('alert-warning') ){
        document.getElementsByClassName("answerQ4")[0].classList.remove('alert-warning');
    }
    if ( document.getElementsByClassName("answerQ4")[0].classList.contains('alert-success') ){
        document.getElementsByClassName("answerQ4")[0].classList.remove('alert-success');
    }
    if( !Mask.isValidMask(mask) | !Ip.isValidIp(ip) | !Ip.isValidIp(networkAddress)) {
        console.log("Invalid Mask or IP !");
        document.getElementsByClassName("answerQ4")[0].classList.add('alert-warning');
        document.getElementsByClassName("answerQ4")[0].textContent="Invalid Mask, IP or Network adress !";
        return;
    }
    let network = new Network(ip,mask);
    let answer =  (network.isValidIpForThisNetwork(networkAddress)) ? "L'adresse IP peut être attribuée aux machines de ce réseau" : "L'adresse IP ne peut pas être attribuée aux machines de ce réseau";
    console.log("Question 4 : "+answer);
    document.getElementsByClassName("answerQ4")[0].classList.add('alert-success')
    document.getElementsByClassName("answerQ4")[0].textContent=answer;

}
function question5() {
    let ipMaskInputTxt = document.getElementsByClassName("inputQ5");
    let ip1 = ipMaskInputTxt[0].value;
    let mask1 = ipMaskInputTxt[1].value;
    let ip2 = ipMaskInputTxt[2].value;
    let mask2 = ipMaskInputTxt[3].value;
    question5_Operations(ip1,mask1,ip2,mask2);
}
function question5_Operations(ip1,mask1,ip2,mask2) {
    if ( document.getElementsByClassName("answerQ5")[0].classList.contains('alert-warning') ){
        document.getElementsByClassName("answerQ5")[0].classList.remove('alert-warning');
    }
    if ( document.getElementsByClassName("answerQ5")[0].classList.contains('alert-success') ){
        document.getElementsByClassName("answerQ5")[0].classList.remove('alert-success');
    }
    if( !Mask.isValidMask(mask1) | !Ip.isValidIp(ip1) | !Mask.isValidMask(mask2) | !Ip.isValidIp(ip2)) {
        console.log("Invalid Mask or IP !");
        document.getElementsByClassName("answerQ5")[0].classList.add('alert-warning');
        document.getElementsByClassName("answerQ5")[0].textContent="Invalid Mask or IP !";
        return;
    }
    let network1 = new Network(ip1,mask1);
    let network2 = new Network(ip2,mask2);
    let answer=(network1.isSameNetwork(network2))?"Les 2 machines font parties du même réseau":"Les 2 machines ne font pas parties du même réseau";
    console.log("Question 5 : "+answer);
    document.getElementsByClassName("answerQ5")[0].classList.add('alert-success')
    document.getElementsByClassName("answerQ5")[0].textContent=answer;

}