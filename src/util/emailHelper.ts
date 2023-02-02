import Mail from "nodemailer/lib/mailer";
import config from "../config";
import * as mailer from "../modules/email";
import { Account } from "../types";

interface BodyParams {
    sign?: string;
    luckDraw?: string;
    bugFix?: string;
    digMine?: string;
    mineCount?: number;
    account?: Account;
}


export function buildBody(params: BodyParams) {
    return `
    <div>-----------------------------------------------</div>
    <div><b>账号${params.account?.account}执行结果：</b></div>
    <div>签到：${params.sign}</div>
    <div>抽奖：${params.luckDraw}</div>
    <div>bugFix：${params.bugFix}</div>
    <div>挖矿：${params.digMine}</div>
    <div>矿石总数：${params.mineCount}</div>
    `
}


interface ResultInfo {
    type: "autoBugFix" | "autoDigMine" | "autoLuckDraw" | "autoSign" | "autoMineCount";
    success: boolean;
    data: any;
    message: string;
}

interface SendOptions{
    results: ResultInfo[];
    account: Account;
}

export function sendHappyResult(happyResultArray: SendOptions[]) {
    let htmlStr="";
    let winningMsg="";
    for(let i=0;i<happyResultArray.length;i++){
        const options=happyResultArray[i];

        const bodyParams: BodyParams = {
            account: options.account
        };
    
        options.results.forEach(r => {
            switch (r.type) {
                case "autoBugFix":
                    bodyParams.bugFix = r.success ? `已完成, 收集bug数量${r.data?.count}`: `失败，原因：${r.message}`
                    break;
                case "autoDigMine":
                    bodyParams.digMine = r.success ? `已完成。当局获取：${r.data.gameDiamond}, 今日获取：${r.data.todayDiamond}`: `失败，原因：${r.message}`
                    break;
                case "autoLuckDraw":
                    bodyParams.luckDraw = r.success ? `已完成,结果:${r.data.luckDrawResult}`: `失败，原因：${r.message}`
                    break;
                case "autoSign":
                    bodyParams.sign = r.success ? `已完成。持续签到${r.data?.continuousDays ?? '-'}天，累计签到${r.data?.totalDays ?? '-'}天`: `失败，原因：${r.message}`
                    break;
                case 'autoMineCount':
                    //矿石总数量
                    bodyParams.mineCount = r.success ? r.data?.mineCount ?? '-': '失败：原因'
                default:
                    break;
            }
        })

        htmlStr += buildBody(bodyParams);
        
       if(bodyParams.luckDraw && !bodyParams.luckDraw.match(/(矿石|彩蛋|抽奖)/)){
         winningMsg+=`<h1 style="color:blue">${bodyParams.account}：：${bodyParams.luckDraw}</h1>`;
       }
    }
    
    const mailOptions: Mail.Options = {
        from: config.user.email,
        to: config.user.email,
        subject: winningMsg?'【掘金】中奖':"掘金Happy通知",
        html: winningMsg+htmlStr
    }
    mailer.sendQQEmail(mailOptions);
}

