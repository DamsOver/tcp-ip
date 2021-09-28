// Renvoi true si l'ip est valide
function isValidIp(ip) {
    let regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
}
// 192.168.1.1
// Renvoi true si le masque est valide
function isValidMask(mask) {
    let regex;
    if(mask.charAt(0)==='/') {
        mask = mask.replace(/^\//, "");
        regex = /^([1-9]|[1-2][0-9]|3[0-2])$/;
    } else {
        regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    }
    return regex.test(mask);
}