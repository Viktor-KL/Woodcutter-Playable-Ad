import type { JoyInput } from '../types'

type CreateJoystickOptions = {
  baseEl: HTMLDivElement
  thumbEl: HTMLDivElement
  onPointerDown?: () => void
}

export type JoystickController = {
  input: JoyInput
  destroy: () => void
}

const BASE_SIZE = 120
const THUMB_SIZE = 54
const MAX_OFFSET = BASE_SIZE / 2 - THUMB_SIZE / 2

export function createJoystick(options: CreateJoystickOptions): JoystickController {
  const { baseEl, thumbEl, onPointerDown } = options

  const input: JoyInput = { x: 0, y: 0 }
  let active = false
  let pointerId: number | null = null

  function resetJoystick(): void {
    thumbEl.style.left = '50%'
    thumbEl.style.top = '50%'
    input.x = 0
    input.y = 0
  }

  function setThumbOffset(dx: number, dy: number): void {
    thumbEl.style.left = `${BASE_SIZE / 2 + dx}px`
    thumbEl.style.top = `${BASE_SIZE / 2 + dy}px`
  }

  function updateJoystick(clientX: number, clientY: number): void {
    const rect = baseEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY

    const distance = Math.hypot(dx, dy)
    if (distance > MAX_OFFSET) {
      const k = MAX_OFFSET / distance
      dx *= k
      dy *= k
    }

    setThumbOffset(dx, dy)
    input.x = dx / MAX_OFFSET
    input.y = dy / MAX_OFFSET
  }

  function handlePointerDown(e: PointerEvent): void {
    active = true
    pointerId = e.pointerId

    baseEl.setPointerCapture(e.pointerId)
    updateJoystick(e.clientX, e.clientY)
    onPointerDown?.()
  }

  function handlePointerMove(e: PointerEvent): void {
    if (!active) return
    if (e.pointerId !== pointerId) return
    updateJoystick(e.clientX, e.clientY)
  }

  function endJoystick(e: PointerEvent): void {
    if (e.pointerId !== pointerId) return
    active = false
    pointerId = null
    resetJoystick()
  }

  baseEl.addEventListener('pointerdown', handlePointerDown)
  baseEl.addEventListener('pointermove', handlePointerMove)
  baseEl.addEventListener('pointerup', endJoystick)
  baseEl.addEventListener('pointercancel', endJoystick)

  return {
    input,
    destroy: () => {
      baseEl.removeEventListener('pointerdown', handlePointerDown)
      baseEl.removeEventListener('pointermove', handlePointerMove)
      baseEl.removeEventListener('pointerup', endJoystick)
      baseEl.removeEventListener('pointercancel', endJoystick)
    },
  }
}
