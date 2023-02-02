import { Browser, HTTPResponse, Page } from "puppeteer";
import { Account } from "../types";
import * as digMineService from "../api/digMine"
import { generateXTTGameId } from "../util/digMine";
import { delay } from "../util";

/**
 * 获取游戏token
 * @param page 
 * @returns 
 */
function getGameToken(page: Page) {
    return new Promise(async (resolve, reject) => {
        let ticket = setTimeout(() => reject(new Error("获取gameToken超时")), 30 * 1000);

        await page.goto("https://juejin.cn/game/haidijuejin/?utm_campaign=hdjjgame&utm_medium=user_center", {
            waitUntil: "domcontentloaded"
        });

        const onResponse = (response: HTTPResponse) => {
            const url = response.url();
            if (url.includes("https://juejin.cn/get/token")) {
                clearTimeout(ticket);
                resolve(response.json());
                // page.off("response", onResponse);
            }
        }

        page.on("response", onResponse);
    })
}


const COMMAND = [
    { "times": 10, "command": ["D", "R", "2", "R", "D", { "times": 10, "command": ["U", "L", "D", "6", "D", "L", "L", "D", "2"] }] }
];


/**
 * 确保游戏结束
 * @param account 
 * @returns 
 */
async function ensureOverGame(account: Account) {
    const resInfo = await digMineService.gameInfo(account.uid);
    if (!resInfo || resInfo.code != 0) {
        console.error("autoDigMine: gameInfo状态获取失败");
        return false
    }
    // 1表示有进行中的
    if (resInfo.data.gameStatus != 1) {
        return true;
    }
    const resOverGame = await digMineService.overGame(account.uid);
    console.log("autoDigMine: overGame完毕：", resOverGame.code, resOverGame.message);
    return resOverGame && resOverGame.code === 0
}


async function gameCommand(gameId: string, account: string) {
    // 生成header的 x-tt-gameid
    const xttGameId = generateXTTGameId(gameId);

    // 执行命令
    const resGameCommand = await digMineService.gameCommand(account, {
        command: COMMAND
    }, {
        headers: {
            "x-tt-gameid": xttGameId
        }
    });

    if (!resGameCommand || resGameCommand.code !== 0) {
        console.error("autoDigMine: gameCommand failed:", resGameCommand);
        return {
            success: false,
        };
    }
    console.log("autoDigMine: gameCommand success:", resGameCommand.data.gameDiamond);

    return {
        success: true,
    }
}


export default async function autoDigMine(browser: Browser, _page: Page, account: Account) {

    let page: Page;
    try {

        page = await browser.newPage();
        // 获取游戏token
        const res: any = await getGameToken(page);
        if (!res || !res.data) {
            console.error("autoDigMine:获取游戏token失败")
            return {
                success: false,
            };
        }
        // 设置Authorization
        digMineService.setHeaders({
            "Authorization": `Bearer ${res.data}`
        });

        console.log("确保结束游戏")
        const overGame = await ensureOverGame(account);
        console.log("结束游戏完毕：", overGame
        )

        // 开始游戏
        const resStartGame = await digMineService.startGame(account.uid);
        if (!resStartGame || resStartGame.code != 0) {
            console.error("autoDigMine: startGame error:", resStartGame.data, resStartGame.message);
            return {
                success: false,
            }
        }
        const cmdRes = await gameCommand(resStartGame.data.gameId, account.uid);
        if (!cmdRes.success) {
            return cmdRes;
        }

        await delay(10 * 1000);

        console.log("autoDigMine: 准备终止游戏");
        const resOverGame = await digMineService.overGame(account.uid);

        if (!resOverGame || resOverGame.code !== 0) {
            console.error("autoDigMine：终止游戏异常", resOverGame);
            return {
                success: false
            }
        }

        const data = {
            gameDiamond: resOverGame.data.gameDiamond, // 当局获取
            realDiamond: resOverGame.data.realDiamond,// 真实获取
            todayDiamond: resOverGame.data.todayDiamond // 今日获取
        }

        console.log("autoDigMine result:", data);

        return {
            success: true,
            data
        }
    } catch (err: any) {
        console.log("autoDigMine error:", err);
        return {
            success: false,
            message: err && err.message
        }
    }
    finally {
        // @ts-ignore
        if (page && !page.isClosed()) {
            await page.close();
        }
    }
}