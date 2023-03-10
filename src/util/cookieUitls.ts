import fs from 'fs';
import path from 'path';
import config from '../config';

let globalCookies={};

export function initCookies() {
    if (!fs.existsSync(path.join(__dirname, "../cookies.json"))) {
        globalCookies=config.user.cookies||{};
        return;
    }
    const cookies = require("../cookies.json");
    globalCookies=cookies;
}

export function getLocalCookie(){
    return globalCookies as any;
}

export function setLocalCookies(cookies:any){
    globalCookies=cookies;
      //重新新的cookie
    fs.writeFileSync(path.join(__dirname, "../cookies.json"), JSON.stringify(globalCookies, null, "\t"));
}