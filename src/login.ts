import fs from 'fs';
import path from 'path';
import { createPage } from "./util/puppeteer";
import { URLS } from "./const";
import { autoSlideAndCookie } from "./autoSlider";
import {  Page } from 'puppeteer';
import config from './config';
import { Account } from './types';
import { getLocalCookie, setLocalCookies } from './util/cookieUitls';

async function checkIsLogin(page: Page) {
    const loginBtn = await page.$(".login-button");
    return !loginBtn
}

export async function ensureLogin(accountInfo: Account, page: Page) {
    // 写入cookie
    // const cookies = require("./cookie.json");
    console.log(`${accountInfo.account}准备登录`);
    const cookies = getLocalCookie();
    const curCookies = cookies[accountInfo.account];
    if (Array.isArray(curCookies) && curCookies.length > 0) {
        //执行操作
        await page.setCookie(...curCookies)
    }

    await page.goto(URLS.Home);
    await page.waitForTimeout(3000);
    // 检查是否登录
    const isLogin = await checkIsLogin(page);
    console.log("isLogin: " + isLogin);

    if (!!isLogin) {
        console.log('已登录，无需登录');
        return isLogin
    }
    // 未登录，点击登录
    if (!isLogin) {
        await page.click('.login-button');
        await page.waitForTimeout(3000);
    }
    await page.waitForSelector('.auth-modal-box');
    await page.waitForTimeout(3000);

    // 其他登录方式
    await page.click(".auth-modal-box .clickable");
    await page.waitForTimeout(2000);

    // 输入账号密码
    // const account = getAccount();
    await page.type('.auth-modal-box .account-input', accountInfo.account, {
        delay: 100
    });
    //
    await page.type('.auth-modal-box [name="loginPassword"]', config.user.password!, {
        delay: 100
    });
    // 点击登录
    await page.waitForTimeout(1000);
    await page.click('.auth-modal-box .panel>.btn');

    // 检查滑块
    await page.waitForTimeout(5000);

    const captchaEl = await page.$('.captcha-modal-container');
    // 没有验证码
    if (!captchaEl) {
        // 等待6秒，保存cookies
        await page.waitForTimeout(6000);
        const curUserCookie = await page.cookies();
        const newCookie = { ...cookies, [accountInfo.account]: curUserCookie };
        setLocalCookies(newCookie);
        // cookies = newCookie;
        // fs.writeFileSync(path.join(__dirname, "../cookies.json"), JSON.stringify(cookies, null, "\t"));
    }
    // 自动滑块
     await autoSlideAndCookie(page, accountInfo.account);
    
}