import type { GameStatus } from '../types'

export type GameRuntimeState = {
  woodCount: number
  money: number
  baseConvertTimer: number
  timeLeft: number
  gameStatus: GameStatus
  gameStarted: boolean
  endResultHandled: boolean
}

export function createGameState(initialTime: number): GameRuntimeState {
  return {
    woodCount: 0,
    money: 0,
    baseConvertTimer: 0,
    timeLeft: initialTime,
    gameStatus: 'playing',
    gameStarted: false,
    endResultHandled: false,
  }
}
