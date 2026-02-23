import type { Group } from 'three'

export type GameStatus = 'playing' | 'win' | 'lose'

export type JoyInput = {
  x: number
  y: number
}

export type TreeEntity = {
  root: Group
  alive: boolean
}

export type ResultStatus = Exclude<GameStatus, 'playing'>
