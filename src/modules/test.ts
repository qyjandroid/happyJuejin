import * as mailer from "./email";
import Mail, { Address } from "nodemailer/lib/mailer";

import config from "../config"
import { buildBody } from "../util/emailHelper";


const options: Mail.Options =  {
    from: config.user.email,
    to: config.user.email,
    subject: "掘金Happy通知",
    html: buildBody({
        sign: "已签到",
        luckDraw: "已抽奖",
        bugFix: "已完成",
        digMine: "已完成",
        mineCount: 1000
    })
}

mailer.sendQQEmail(options)