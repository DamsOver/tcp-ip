function splitStringIntoPartOfNCharacter(str, n) {
    let regex = new RegExp(".{1,"+n+"}","g");
    return str.match(regex);
}

function convertIpDecimalToBinary(ipOrMask) {
    let ipOrMaskArray = (!Array.isArray(ipOrMask)) ? convertIpStringToArray(ipOrMask) : ipOrMask;
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(parseInt(ipOrMaskArray[i], 10).toString(2).padStart(8, "0"));
    }
    return ipOrMaskArrayBinary;
}

function convertIpBinaryToDecimal(ipOrMask) {
    let ipOrMaskArray=(!Array.isArray(ipOrMask)) ? convertIpStringToArray(ipOrMask) : ipOrMask;
    let ipOrMaskArrayDecimal=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayDecimal.push(parseInt(ipOrMaskArray[i], 2).toString(10));
    }
    return ipOrMaskArrayDecimal;
}

function convertIpStringToArray(ipOrMask) {
    const ipOrMaskArray = ipOrMask.split('.');
    let ipOrMaskArrayBinary=[];
    for (let i in ipOrMaskArray) {
        ipOrMaskArrayBinary.push(ipOrMaskArray[i]);
    }
    return ipOrMaskArrayBinary;
}

function convertIpArrayToString(array) {
    return array.join('.');
}

function convertMaskCidrToClassic(maskCidr) {
    maskCidr = maskCidr.replace(/^\//, "");
    let tmpMask = ''.padStart(maskCidr, "1").padEnd(32, "0");
    let maskClassic = splitStringIntoPartOfNCharacter(tmpMask,8);
    return convertIpArrayToString( convertIpBinaryToDecimal(maskClassic) );
}

function convertMaskClassicToCidr(maskClassic) {
    let MaskArray = (!Array.isArray(maskClassic)) ? convertIpStringToArray(maskClassic) : maskClassic;
    let cidr = 0;
    for(let i in MaskArray) {
        let tmp = (parseInt(MaskArray[i]).toString(2)).match(/1/g) || []
        cidr += tmp.length;
    }
    return cidr;
}