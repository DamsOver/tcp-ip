// 1. Détermine la classe à laquelle appartient une adresse IP si on travaille en mode classfull
function classOfIpClassfull(ip) {
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
function findNetwork(ip, mask) {
    return andOrOperationIpMask(ip, mask, true);
}
function findBroadcast(ip, mask) {
    let invertedMask = reverseMask(mask);
    invertedMask = convertIpBinaryToDecimal(invertedMask);
    invertedMask = convertIpArrayToString(invertedMask);
    return andOrOperationIpMask(ip, invertedMask, false);
}

function reverseMask(mask) {
    let maskArray = convertIpDecimalToBinary(mask);
    maskArray = convertIpArrayToString(maskArray).replace(/\./g, '');
    let tmpArray = [];
    for (let i = 0; i < maskArray.length; i++) {
        tmpArray.push( (maskArray[i]===0 || maskArray[i]==='0') >>> 0);
    }
    return splitStringIntoPartOfNCharacter(tmpArray.join(''),8);
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

// 5. Détermine si chaque machine considère l’autre comme faisant partie de son réseau ou pas.
function isSameNetwork(net1, mask1, net2, mask2) {
    return true; // maybe 2 boolean to return
}

function andOrOperationIpMask(ip, mask, isAndOperation) {
    let ipArray = (!Array.isArray(ip)) ? convertIpStringToArray(ip) : ip;
    let maskArray = (!Array.isArray(mask)) ? convertIpStringToArray(mask) : mask;
    let tmpArray = [];
    for (let i = 0; i < ipArray.length; i++) {
        tmpArray.push( (isAndOperation) ? (ipArray[i]&maskArray[i]).toString() : (ipArray[i]|maskArray[i]).toString() );
    }
    return tmpArray;
}