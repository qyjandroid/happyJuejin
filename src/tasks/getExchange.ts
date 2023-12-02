import { Browser, Page } from "puppeteer";
import { Account } from "../types";
import { findButtonAndClick } from "../util/puppeteerElementUtils";

export default async function getExchange(_browser: Browser, page: Page, _account: Account) {
    let resultStr="";
    try {
        await page.waitForTimeout(1000);
        await findButtonAndClick(page,".menu.byte-menu a","福利兑换");
        const result=await getExchangeList(page);
        if(result){
            resultStr=parseExchangeList(result || []);
        }
        await page.waitForTimeout(6000);
        console.log("已经:跳转到福利兑换界面");
    } catch (err: any) {
        console.error("福利兑换界面:error：", err);
        return ""
    }

    return {
        message: "",
        success: true,
        data: resultStr
    };
}

function parseExchangeList(list:any[]){
    const result=[];
    for(let i=0;i<list.length;i++){
        const item=list[i];
        const lottery=item.lottery;
        const name=lottery?.lottery_base?.lottery_name || item.benefit_config?.lottery_name || "";
        const prizeValue=item.benefit_config?.count;
        const curCap=lottery?.lottery_extra?.cur_cap;
        const useCap=lottery?.lottery_extra?.use_cap;
        if(curCap>0){
            result.push(`<div>${name}-价值-${prizeValue}-已兑换-${useCap}-剩余-${curCap}</div>`);
        }
    }
    return result.join("")
    
}


function getExchangeList(page:Page): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            await page.setRequestInterception(true);
            let timeOut = setTimeout(() => {
                reject('');
                page.off("request",onReq);
                page.off("response", onResponse);
            }, 1000 * 20);
            const onResponse = async (res:any) => {
                const url = res.request().url().toLowerCase();
                if (url.includes("growth_api/v1/get_benefit_page")) {
                    if (res.ok()) {
                        const data = await res.json();
                        if (data?.data) {
                            clearTimeout(timeOut);
                            page.off("request",onReq);
                            page.off("response", onResponse);
                            resolve(data.data);
                        }
                    }

                }
            }
            const onReq=(req:any) => {
                const url = req.url();
                const method = req.method().toLowerCase();
                if (method == "head" || method === "options" || !url.includes("growth_api/v1/get_benefit_page")) {
                    return req.continue();
                }
                req.continue({
                  postData:JSON.stringify({
                    page_no:1,
                    page_size:50,
                    type:1,
                    got_channel:2
                  })
                })
            };

            page.on("request", onReq);
            page.on("response", onResponse)
        })
};
