
interface Position {
    x: number;
    y: number;
}

type MapData = number[];

interface BlockData {
    moveUp: number;
    moveDown: number;
    moveLeft: number;
    moveRight: number;
    jump: number;
    loop: number;
}


interface RSData<T> {
    code: number;
    data: T,
    message: string;
    logId?: string;
    /**
     * 服务器时间
     */
    serviceTime?: string
}

export type RSStartGame = RSData<{
    gameId: string;
    seed: number;
    curPos: Position;
    mapData: any[];
    blockData: BlockData
}>

interface GameCommandResult {
    appendMapData: MapData;
    blockData: BlockData;
    curPos: Position;
    gameDiamond: number;
}

export type RSGameCommand = RSData<GameCommandResult>


interface GameInfoResult {
    activity: string;
    gameStatus: 0 | 1;
    userInfo: {
      uid: string;
      name: string;
      todayDiamond: number;
      todayLimitDiamond: number;
      maxTodayDiamond: number;
      badge: string;
    };
    gameInfo: {
      gameId: string;
      roleId: 1 | 2 | 3;
      gameDiamond: number;
      isNew: boolean;
      addRate: number;
      mapData: MapData;
      mapDeep: number;
      blockData: BlockData;
      curPos: Position;
      commandList: any[];
      deep: number;
      elementData: { pearl: number; jellyfish: number; pico: number; starfish: number; shell: number };
      remainDoubleStep: number;
      isGameOver: boolean;
      picoNode: unknown[];
      shopPosList: unknown[];
      passLine: string;
      activity: string;
      picoDiamond: number;
      version: string;
    } | null;
  }

export type RSGameInfo = RSData<GameInfoResult>


interface OverGameResult {
    activity: string;
    deep: number;
    gameDiamond: number; // 当局获取
    originMapData: MapData;
    passLine: Position[];
    picoDiamond: number;
    realDiamond: number; // 真实获取
    todayDiamond: number; // 今日获取
    todayLimitDiamond: number; // 今日最大获取
  }

 export type RSOverGame = RSData<OverGameResult>;
  