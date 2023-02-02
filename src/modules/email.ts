import mailer from "nodemailer";
import Mail, { Address } from "nodemailer/lib/mailer";
import config from "../config"

type EmailUser = string | Address | undefined

export async function sendQQEmail(mailOptions: Mail.Options) {
    const transporter = mailer.createTransport({
        host: "smtp.qq.com",
        port: 587,
        secure: false,
        auth: {
            user: config.user.email,                      // 用户账号
            pass: config.user.emailPassword,              // 授权码,通过QQ获取
        },
    });

    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

}