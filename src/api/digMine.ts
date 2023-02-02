import axios, { AxiosHeaders, AxiosRequestConfig, HeadersDefaults } from 'axios';
import { RSGameCommand, RSGameInfo, RSOverGame, RSStartGame } from './types';

const ins = axios.create({});

type AxiosHeaderValue = AxiosHeaders | string | string[] | number | boolean | null;

export function setHeaders(headers: {
    [key: string]: AxiosHeaderValue
}) {
    ins.defaults.headers = {
        ...ins.defaults.headers,
        ...headers
    }
}

const API_PREFIX = 'https://juejin-game.bytedance.com/game/sea-gold'
const URLS = {
    overGame: `${API_PREFIX}/game/over`,
    startGame: `${API_PREFIX}/game/start`,
    freshMap: `${API_PREFIX}/game/fresh_map`,
    gameCommand: `${API_PREFIX}/game/command`,
    homeInfo: `${API_PREFIX}/home/info`
}

/**
 * 结束游戏
 * @param uid 
 * @returns 
 */
export function overGame(uid: string) {
    return ins.post<RSOverGame>(`${URLS.overGame}?uid=${uid}&time=${Date.now()}`, {
        isButton: 1
    })
        .then(res => res.data)
}

/**
 * 刷新地图
 * @param uid 
 * @returns 
 */
export function freshMap(uid: string) {
    return ins.post(`${URLS.freshMap}?uid=${uid}&time=${Date.now()}`)
        .then(res => res.data)
}

/**
 * 开始游戏
 * @param uid 
 * @returns 
 */
export function startGame(uid: string, roleId: 1 | 2 | 3 = 3) {
    return ins.post<RSStartGame>(`${URLS.startGame}?uid=${uid}&time=${Date.now()}`, {
        roleId
    })
        .then(res => res.data)
}


/**
 * 
 * @param data 
 * @param config 
 * @returns 
 */
export function gameCommand(uid: string, data: {
    command: any[]
}, config: AxiosRequestConfig) {
    return ins.post<RSGameCommand>(`${URLS.gameCommand}?uid=${uid}&time=${Date.now()}`, data, config)
        .then(res => res.data)
}


/**
 * 游戏信息
 * @param uid 
 * @returns 
 */
export function gameInfo(uid: string){
    return ins.get<RSGameInfo>(`${URLS.homeInfo}?uid=${uid}&time=${Date.now()}`)
    .then(res => res.data)
}
