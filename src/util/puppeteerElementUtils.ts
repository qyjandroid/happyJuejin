import puppeteer, { PuppeteerLaunchOptions, Page } from "puppeteer";




export async function findElementByEvaluate(page: Page, selector: string, pageFunction:any, ...args: any[]) {
    const eHList = await page.$$(selector);
    for (let i = 0; i < eHList.length; i++) {
        const eh = eHList[i];
        const match = await eh.evaluate(pageFunction, ...args);
        if (match) {
            return eh;
        }
    }
    return null;
}

/**
 * 
 * 查找按钮并点击
 * @export
 * @param {Page} page 
 * @param {any} selectAttr 
 * @param {any} text 
 */
export async function findButtonAndClick(page: Page, selectAttr:any, text:string) {
    const label = await findElementByEvaluate(page, selectAttr, (node:any, data1:any) => {
        const txt = node.textContent!.trim();
        return txt.includes(data1)
    }, text);
    if (!label) {
        throw new Error(`未找到textContent为${text}的节点，${selectAttr}`)
    }
    await label.evaluate((label: any) => label.click())
}
