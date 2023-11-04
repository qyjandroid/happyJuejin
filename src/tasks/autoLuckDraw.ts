import { Browser, Page } from "puppeteer";
import { Account } from "../types";
import { findButtonAndClick } from "../util/puppeteerElementUtils";

export default async function autoLuckDraw(_browser: Browser, page: Page, _account: Account) {

    let successLuckDraw = false;
    let luckDrawResult="抽奖";
    let successStick = false;
    let luckValue;

    try {
        await page.waitForTimeout(1000);
        await findButtonAndClick(page,".menu.byte-menu a","幸运抽奖");


        await page.waitForTimeout(6000);

        console.log("autoLuckDraw:跳转到抽奖界面");

        let freeLottery = await page.$('.turntable-item.lottery .text-free');
        if (freeLottery) {
            let freeLotteryBtn = await page.$('#turntable-item-0');
            freeLotteryBtn!.click();
            await page.waitForTimeout(5000);
            let submitBtn = await page.$('.lottery-modal .close-icon');
            if (submitBtn) {
                let luckDrawContent=await page.$eval('.lottery-modal .byte-modal__body .title',el=>el.innerHTML);
                if(luckDrawContent==="触发彩蛋"){
                     luckDrawContent=await page.$eval('.lottery-modal .desc p',el=>el.innerHTML);
                }
                console.log(`抽奖成功-${luckDrawContent}`);
                luckDrawResult=luckDrawContent;
                submitBtn.click();
                successLuckDraw = true;
            }
        } else {
            successLuckDraw = true;
            console.log("autoLuckDraw：已抽奖");
            luckDrawResult="已抽奖";
        }

        luckValue= await page.evaluate(() => {
            const curLuckValue = document.querySelector(".progress-wrap .value-wrap .current-value")?.textContent;
            return {
                curLuckValue
            }
          });
          
        
        //沾喜气按钮
        let festivityBtn = await page.$$('svg.stick-btn');
        if(festivityBtn && festivityBtn.length>1){
            festivityBtn[1].click();
            await page.waitForTimeout(3000);
            let blessingBtn = await page.$('.byte-modal__body .btn.btn-submit');
            if (blessingBtn) {
                blessingBtn.click();
            }
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
                luckDrawResult,
                luckValue
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
