import { Browser, Page } from "puppeteer";
import { Account } from "../types";


/**
 * 获得矿石数量
 * @param browser 
 * @param _page 
 * @param account 
 * @returns 
 */
export default async function autoMineCount(browser: Browser, _page: Page, account: Account) {

    let page: Page;
    try {
        page = await browser.newPage();
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36");
        await page.goto("https://juejin.cn/user/center/signin?avatar_menu", {
            waitUntil: "load"
        });
        await page.waitForTimeout(8000);
        // 持续天数和累计签到
        const summary = await page.$eval(".signin .figures", (el) => {
            const cards = el.querySelectorAll(".figure-card");
            return {
                continuousDays: cards.length >= 1 ? cards[0].querySelector(".figure")?.innerHTML : "-",
                totalDays: cards.length >= 2 ? cards[1].querySelector(".figure")?.innerHTML : "-",
                mineCount: cards.length >= 3 ? cards[2].querySelector(".figure")?.innerHTML : "-"
            }
        });
        return {
            success: true,
            data: summary
        }
    } catch (err: any) {
        console.log("autoMineCount error:", err);
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