import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import { ensureLogin } from "./login";
import { Account } from './types';
import { createPage } from "./util/puppeteer";

// tasks
import autoSign from "./tasks/autoSign"
import autoBugFix from './tasks/autoBugFix';
import autoLuckDraw from './tasks/autoLuckDraw';
import autoDigMine from './tasks/autoDigMine';
import autoMineCount from "./tasks/autoMineCount";

import { sendHappyResult } from './util/emailHelper';
import config from './config';
import { initCookies } from './util/cookieUitls';
import { findButtonAndClick } from './util/puppeteerElementUtils';

type Task = (browser: Browser, page: Page, _account: Account) => Promise<any>

//autoDigMine
const taskList: Task[] = [autoSign, autoLuckDraw,  autoMineCount];

// const taskList: Task[] = [autoSign];

const time=Date.now();
if(time<1686498678000){
    //6月12
    taskList.splice(1,0,autoBugFix);
}



// const taskList: Task[] = [ autoDigMine];
function getAccount(): Account[] {
    return (config.user.accounts || '').split('|').map(account => {
        return {
            account,
            uid: ''
        }
    })
}



async function goSignPage(page: Page) {
    // 点击头像
    // console.log('点击头像：开始');
    // await page.click('.avatar-wrapper .avatar');
    // await page.waitForTimeout(2000);
    // await page.waitForSelector('.user-card');
    // console.log('点击头像：完毕');

    // // 点击钻石
    // // console.log('点击钻石：开始');
    // await page.waitForTimeout(2000);
    // await findButtonAndClick(page,'.dropdown-list .dropdown-item a',"成长福利");

    await page.goto("https://juejin.cn/user/center/signin?avatar_menu", {
            waitUntil: "load"
        });
    await page.waitForTimeout(8000);
    // 等待跳转
    // console.log('等待跳转：开始');
    // await page.waitForNavigation({
    //     waitUntil:"load"
    // });
    // console.log('点击钻石：结束');
    console.log('等待跳转：结束');
}

export async function autoAutoHappy() {
    // 获得本地保存的cookie
     initCookies();
    //获取所有的账号
    const accounts = getAccount();
    if (!Array.isArray(accounts)) {
        return console.error("没有账号，终止任务");
    };
    let htmlTempData:any[]=[];
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const statisticsResult= await execAutoTask(account);
        if(statisticsResult){
            htmlTempData.push(statisticsResult);
        }
        
    }
    //发送邮件
    sendHappyResult(htmlTempData);
}

async function ensureUid(page: Page) {
    const html1=await page.evaluate(()=>{return (document.querySelector(".nav-item.menu") as any).outerHTML});
    console.log("html==",html1);
    await page.click('.avatar-wrapper .avatar');
    await page.waitForTimeout(6000);
    const html2=await page.evaluate(()=>{return (document.querySelector(".nav-item.menu") as any).outerHTML});
    console.log("html==",html2);
    await page.waitForSelector('.user-card');
    const uid = await page.$eval(".user-detail .username", el => {
        const href = el.getAttribute("href") || "";
        return href.split("/").pop();
    });
    await page.click('.avatar-wrapper .avatar'); // 关闭
    return uid;
}





async function execAutoTask(account: Account) {
    let browser: Browser;
    let taskResult=null;
    try {
        let pInfo = await createPage({
            headless: true,
            defaultViewport: { width: 1400, height: 1040 },
            args: [`--window-size=${1400},${1040}`],
        });
        let page = pInfo.page;
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
            });
        });
     

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'plugins', {
              get: () => [1, 2, 3],
            });
        });
        await page.evaluateOnNewDocument(() => {
            (window.navigator as any).chrome = {
              runtime: {},
              loadTimes: function() {},
              csi: function() {},
              app: {}
            };
          });
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36");
        browser = pInfo.browser;
        // 确保登录
        await ensureLogin(account, page);

        console.log("execAutoTask:准备获取uid");
        // const uid = await ensureUid(page);
        // account.uid = uid!;
        console.log("execAutoTask:获取uid完毕");

        // 去签到页面
        await goSignPage(page);

        const results = [];
        for (let i = 0; i < taskList.length; i++) {
            try {
                const task = taskList[i];
                console.log(`account:${account.account} 开始执行任务`, task.name);
                const result = await task.apply(null, [browser, page, account]);

                result.type = task.name;
                results.push(result);
                console.log(`account:${account.account} 执行任务完毕`, task.name)

            } catch (error) {
                console.error("任务执行失败:", error);
            }
        }

        await page.waitForTimeout(2000);
        console.log(`${account.account} 所有任务执行完毕`);

        taskResult= {
            account,
            results
        }

        

    } catch (err) {
        console.log('ensureLogin error:', err);
    } finally {
        // @ts-ignore
        if (browser && browser!.isConnected) {
            await browser.close();
        }
        return taskResult;
    }
}


