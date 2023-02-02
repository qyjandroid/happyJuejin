
import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
import _ from "lodash";

const DEFAULT_CREATE_OPTIONS: PuppeteerLaunchOptions = {
    headless: true,
    timeout: 3000,
    slowMo: 10,
    ignoreDefaultArgs: ['--enable-automation', '--disable-extensions'],
    args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-features=site-per-process',
        "--disable-web-security"
    ]
}
export async function createPage(options: PuppeteerLaunchOptions = {}) {
    const browser = await puppeteer.launch(_.merge(DEFAULT_CREATE_OPTIONS, options));
    // 新开标签页
    const page = await browser.newPage();
    // 打开指定网址
    return {
        browser,
        page,
    }
}

