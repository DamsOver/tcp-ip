let regexIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function isValidIp(ip) {
    return regexIP.test(ip);
}
function isValidMask(mask) {
    let regex;
    if(isCidrMask(mask)) {
        mask = mask.replace(/^\//, "");
        regex = /^([1-9]|[1-2][0-9]|3[0-2])$/;
    } else {
        regex = regexIP;
    }
    return regex.test(mask);
}
function isCidrMask(mask) {
    return mask.charAt(0)==='/';
}