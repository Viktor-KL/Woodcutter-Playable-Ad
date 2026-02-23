import type { ResultStatus } from '../types'

type HudUpdate = {
  wood: number
  money: number
  timeLeft: number
}

export type HudController = {
  setGoal: (goal: number) => void
  update: (data: HudUpdate) => void
  showResult: (status: ResultStatus) => void
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing required HUD element: #${id}`)
  }
  return element as T
}

function triggerHudPop(el: HTMLElement): void {
  el.classList.remove('pop')
  void el.offsetWidth
  el.classList.add('pop')
}

export function createHud(): HudController {
  const woodValueEl = getRequiredElement<HTMLSpanElement>('wood-value')
  const moneyValueEl = getRequiredElement<HTMLSpanElement>('money-value')
  const timeValueEl = getRequiredElement<HTMLSpanElement>('time-value')
  const goalValueEl = getRequiredElement<HTMLSpanElement>('goal-value')
  const winOverlayEl = getRequiredElement<HTMLDivElement>('win-overlay')
  const loseOverlayEl = getRequiredElement<HTMLDivElement>('lose-overlay')

  let prevWood = -1
  let prevMoney = Number.NaN
  let prevShownTime = -1
  let resultShown = false

  return {
    setGoal: (goal: number) => {
      goalValueEl.textContent = `${goal} $`
    },

    update: ({ wood, money, timeLeft }) => {
      if (wood !== prevWood) {
        woodValueEl.textContent = String(wood)
        triggerHudPop(woodValueEl)
        prevWood = wood
      }

      if (money !== prevMoney) {
        moneyValueEl.textContent = `${money.toFixed(0)} $`
        triggerHudPop(moneyValueEl)
        prevMoney = money
      }

      const shownTime = Math.ceil(timeLeft)
      if (shownTime !== prevShownTime) {
        timeValueEl.textContent = String(shownTime)
        triggerHudPop(timeValueEl)
        prevShownTime = shownTime
      }
    },

    showResult: (status) => {
      if (resultShown) return
      resultShown = true

      if (status === 'win') {
        winOverlayEl.classList.remove('hidden')
        return
      }

      loseOverlayEl.classList.remove('hidden')
    },
  }
}
