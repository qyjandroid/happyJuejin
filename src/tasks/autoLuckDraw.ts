import { Browser, Page } from "puppeteer";
import { Account } from "../types";

export default async function autoLuckDraw(_browser: Browser, page: Page, _account: Account) {

    let successLuckDraw = false;
    let luckDrawResult="抽奖";
    let successStick = false;

    try {
        await page.waitForTimeout(1000);
        let menus = await page.$$('.menu.byte-menu a');
        menus[2].click();

        await page.waitForTimeout(6000);

        console.log("autoLuckDraw:跳转到抽奖界面");

        let freeLottery = await page.$('.turntable-item.lottery .text-free');
        if (freeLottery) {
            let freeLotteryBtn = await page.$('#turntable-item-0');
            freeLotteryBtn!.click();
            await page.waitForTimeout(5000);
            let submitBtn = await page.$('.byte-modal__body .submit');
            if (submitBtn) {
                submitBtn.click();
                successLuckDraw = true;
                let luckDrawContent=await page.$eval('.lottery_modal .byte-modal__body .title',el=>el.innerHTML);
                console.log(`抽奖成功-${luckDrawContent}`);
                luckDrawResult=luckDrawContent;
            }
        } else {
            successLuckDraw = true;
            console.log("autoLuckDraw：已抽奖");
            luckDrawResult="已抽奖";
        }
        //沾喜气按钮
        let festivityBtn = await page.$$('svg.stick-btn');
        festivityBtn[1].click();
        await page.waitForTimeout(3000);
        let blessingBtn = await page.$('.byte-modal__body .btn.btn-submit');
        if (blessingBtn) {
            blessingBtn.click();
        }
        successStick = true;
        console.log("autoLuckDraw：已沾福气")
    } catch (err: any) {
        console.error("autoLuckDraw:error：", err);
        return {
            message: err.message,
            success: false,
            data: {
                successStick,
                successLuckDraw,
                luckDrawResult
            }
        }
    }

    return {
        success: true,
        data: {
            successStick,
            successLuckDraw,
            luckDrawResult,
        }
    }
}
