// Work in progress...

/**
 * @author Auversack Damien
 * @date 20-09-2021
*/

// Renvoi true si l'ip est valide
function isValidIp(ip) {
    console.log(ip);
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
function findNetworkAndBroadcast(ip, mask) {
    const ipArray = ip.split('.');
    const maskArray = mask.split('.');
    let ipArrayBinary=[];
    let maskArrayBinary=[];
    for (let i in ipArray) {
        ipArrayBinary.push(parseInt(ipArray[i], 10).toString(2).padStart(8, "0"))
    }
    for (let i in maskArray) {
        maskArrayBinary.push(parseInt(maskArray[i], 10).toString(2).padStart(8, "0"))
    }

    return [ipArrayBinary, maskArrayBinary];
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

console.log(classOfIpClassfull("192.168.1.34"));
console.log(nbNetworkOfClass("C"));
console.log(nbHostOfClass("C"));
console.log(findNetworkAndBroadcast("192.168.1.1","255.255.255.0"));