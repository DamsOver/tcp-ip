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
