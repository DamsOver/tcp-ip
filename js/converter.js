function convertDecimalToBinary(ipOrMask, isAnArray) {
    let ipOrMaskArray = (!isAnArray) ? convertIpStringToIpArray(ipOrMask) : ipOrMask;
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 10).toString(2).padStart(8, "0"));
    }
    return ipOrMaskArrayBinary;
}

function convertBinaryToDecimal(ipOrMask, isAnArray) {
    let ipOrMaskArray=(!isAnArray) ? convertIpStringToIpArray(ipOrMask) : ipOrMask;

    let ipOrMaskArrayDecimal=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayDecimal.push(parseInt(ipOrMaskArray[i], 2).toString(10));
    }
    return ipOrMaskArrayDecimal;
}

function convertIpStringToIpArray(ipOrMask) {
    const ipOrMaskArray = ipOrMask.split('.');
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i]))
    }
    return ipOrMaskArrayBinary;
}

function convertIpArrayToIpString(array) {
    return array.join('.');
}

function convertCidrToClassicMask(maskCidr) {
    maskCidr = maskCidr.replace(/^\//, "");
    let tmpMask = '';
    for (let i = 0; i < maskCidr; i++) {
        tmpMask += '1';
    }
    tmpMask = tmpMask.padEnd(32, "0");
    let octets=[];
    for (let i = 0; i < 4; i++) {
        octets.push(tmpMask.slice(0,8));
        tmpMask = tmpMask.substring(8,32);
    }

    return convertIpArrayToIpString( convertBinaryToDecimal(octets,true) );
}