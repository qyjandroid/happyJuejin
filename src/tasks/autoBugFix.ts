import { Browser, ElementHandle, Page } from "puppeteer";
import { Account } from "../types";
import { getBaseRandomValue } from "../util";

/**
 * 引导
 * @param page 
 */
async function stepGuide(page: Page) {
    await page.waitForTimeout(2000);
    let menus = await page.$$('.menu.byte-menu a');
    menus[4].click();
    await page.waitForTimeout(6000);
    let steps = await page.$$('.step');
    if (steps && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
            const stepBtn = steps[i];
            stepBtn.click();
            await page.waitForTimeout(2000);
        }
        console.log(`autoBugFix：完成收集bug引导`);
    } else {
        console.log(`autoBugFix：准备收集bug`);
    }
}

export default async function autoBugFix(_browser: Browser, page: Page, _account: Account) {
    try {
        // 引导
        await stepGuide(page);
        // 收集bug
        const result = await collectBug(page);

        //获取bug总数
        await page.waitForTimeout(getBaseRandomValue(1000, 200));
        let ownTotalBugs=await page.$eval('.own-bugs .own-remain .value',el=>el.innerHTML);
        if(result && result.data){
            result.data.ownTotalBugs=ownTotalBugs;
        }
        console.log("autoBugFix 完毕:", result);
        return result;
    } catch (err: any) {
        console.log("autoBugFix:error:", err);
        return {
            success: false,
            message: err && err.message!
        }
    }
}


/**
 * 收集bug
 * @param page 
 */
async function collectBug(page: Page) {
    await page.waitForTimeout(3000);
    let blessingBtn = await page.$('.byte-modal__body .byte-btn.byte-btn--default.byte-btn--normal');
    if (blessingBtn) {
        blessingBtn.click();
    }

    let collectCount = 0;

    await page.waitForTimeout(getBaseRandomValue(6000, 200));
    let bugs: ElementHandle<Element>[] = await page.$$('.item.bug-item-web')

    while (bugs && bugs.length > 0){
        for (let i = 0; i < bugs.length; i++) {
            const bugBtn = bugs[i];
            bugBtn.click();
            collectCount++;
            await page.waitForTimeout(getBaseRandomValue(1000, 200));
        }
        await page.waitForTimeout(getBaseRandomValue(6000, 200));
        bugs = await page.$$('.item.bug-item-web');
    }
    return {
        success: true,
        data: {
            count: collectCount,
            ownTotalBugs:""
        }
    }
}