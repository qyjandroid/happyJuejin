const env = process.env || {};

export default {
    user: {
        accounts: env.USER_ACCOUNT_LIST,
        password: env.USER_PASSWORD, // 你的掘金登录密码
        email: env.USER_EMAIL , // 你的接收通知的邮箱
        emailPassword: env.USER_EMAIL_PASSWORD // 邮箱授权码
    },
}