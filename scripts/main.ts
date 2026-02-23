import * as THREE from 'three'
import { Group as TweenGroup } from '@tweenjs/tween.js'
import {
  BASE_CONVERT_INTERVAL,
  CAMERA_FOLLOW_HEIGHT,
  CAMERA_FOLLOW_Z_OFFSET,
  CAMERA_LERP_ALPHA,
  CAMERA_LOOK_Y_OFFSET,
  CHOP_HIT_RADIUS,
  GAME_TIME,
  MONEY_GOAL,
  TREE_MIN_DISTANCE,
  WORLD_LIMIT,
} from './config'
import { createWorld } from './core/world'
import { createBaseZone } from './game/base'
import { createPlayerSystem } from './game/player'
import { createAxeSystem } from './game/axe'
import { createForestSystem } from './game/forest'
import { createJoystick } from './input/joystick'
import { createHud } from './ui/hud'
import { createAudioController } from './audio/audio'
import { createGameState } from './game/state'

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing required element: #${id}`)
  }
  return element as T
}

const tweenGroup = new TweenGroup()

const world = createWorld()
const baseZone = createBaseZone({ scene: world.scene, radius: 1.4 })
const player = createPlayerSystem(world.scene)
const axe = createAxeSystem(player.root, tweenGroup)

const game = createGameState(GAME_TIME)

const hud = createHud()
hud.setGoal(MONEY_GOAL)

const audio = createAudioController({
  shouldPlayTheme: () => game.gameStatus === 'playing',
})

const forest = createForestSystem({
  scene: world.scene,
  tweenGroup,
  worldLimit: WORLD_LIMIT,
  treeMinDistance: TREE_MIN_DISTANCE,
  chopHitRadius: CHOP_HIT_RADIUS,
  onWoodCollected: () => {
    game.woodCount += 1
  },
  onChop: () => {
    audio.playChop()
  },
})

void forest

const joystick = createJoystick({
  baseEl: getRequiredElement<HTMLDivElement>('joy-base'),
  thumbEl: getRequiredElement<HTMLDivElement>('joy-thumb'),
  onPointerDown: () => {
    audio.unlock()

    if (!game.gameStarted) {
      game.gameStarted = true
    }
  },
})

void joystick

const cameraTargetPos = new THREE.Vector3()
const axeWorldPos = new THREE.Vector3()

function updateCameraFollow(): void {
  cameraTargetPos.set(
    player.root.position.x,
    player.root.position.y + CAMERA_FOLLOW_HEIGHT,
    player.root.position.z + CAMERA_FOLLOW_Z_OFFSET,
  )

  world.camera.position.lerp(cameraTargetPos, CAMERA_LERP_ALPHA)
  world.camera.lookAt(
    player.root.position.x,
    player.root.position.y + CAMERA_LOOK_Y_OFFSET,
    player.root.position.z,
  )
}

function updateGameplay(delta: number): void {
  player.update(delta, joystick.input)

  tweenGroup.update()
  axe.update()

  if (axe.getWorldPosition(axeWorldPos)) {
    forest.tryChopAt(axeWorldPos)
  }

  game.baseConvertTimer = Math.max(0, game.baseConvertTimer - delta)

  if (
    game.gameStatus === 'playing' &&
    baseZone.containsXZ(player.root.position.x, player.root.position.z) &&
    game.woodCount > 0 &&
    game.baseConvertTimer <= 0
  ) {
    const woodPrice = THREE.MathUtils.randFloat(10, 20)
    game.woodCount -= 1
    game.money += woodPrice
    game.baseConvertTimer = BASE_CONVERT_INTERVAL
    audio.playConvert()
  }

  if (game.gameStatus === 'playing' && game.gameStarted) {
    game.timeLeft = Math.max(0, game.timeLeft - delta)

    if (game.money >= MONEY_GOAL) {
      game.gameStatus = 'win'
    } else if (game.timeLeft <= 0) {
      game.gameStatus = 'lose'
    }
  }

  if (!game.endResultHandled && game.gameStatus !== 'playing') {
    game.endResultHandled = true
    audio.pauseTheme()

    if (game.gameStatus === 'win') {
      audio.playWin()
      hud.showResult('win')
    } else {
      audio.playLose()
      hud.showResult('lose')
    }
  }
}

function animate(): void {
  requestAnimationFrame(animate)

  const delta = Math.min(world.clock.getDelta(), 0.033)

  updateGameplay(delta)
  updateCameraFollow()

  hud.update({
    wood: game.woodCount,
    money: game.money,
    timeLeft: game.timeLeft,
  })

  world.renderer.render(world.scene, world.camera)
}

animate()
