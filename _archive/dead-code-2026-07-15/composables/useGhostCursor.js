import { setupGsap } from '~/lib/animations/gsap'

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomWaypoint() {
  return {
    x: randomBetween(0.15, 0.85),
    y: randomBetween(0.15, 0.85),
  }
}

export function useGhostCursor(onUpdate, options = {}) {
  const {
    idleDelay = 3000,
    pathDelay = 1500,
  } = options

  const { gsap } = setupGsap()

  let idleTimer = 0
  let pathTimer = 0
  let timeline = null
  let active = false
  let destroyed = false

  const pos = { x: 0.5, y: 0.5 }

  function clearTimers() {
    if (idleTimer) {
      window.clearTimeout(idleTimer)
      idleTimer = 0
    }
    if (pathTimer) {
      window.clearTimeout(pathTimer)
      pathTimer = 0
    }
  }

  function killTimeline() {
    timeline?.kill()
    timeline = null
  }

  function generatePath() {
    const count = Math.floor(randomBetween(5, 9))
    return Array.from({ length: count }, randomWaypoint)
  }

  function runPath() {
    if (destroyed || !active) {
      return
    }

    killTimeline()
    timeline = gsap.timeline({
      onComplete() {
        if (!destroyed && active) {
          pathTimer = window.setTimeout(runPath, pathDelay)
        }
      },
    })

    for (const waypoint of generatePath()) {
      timeline.to(pos, {
        x: waypoint.x,
        y: waypoint.y,
        duration: randomBetween(1.5, 2.5),
        ease: 'power1.inOut',
        onUpdate() {
          onUpdate(pos.x, pos.y)
        },
      })
    }
  }

  function activate() {
    if (destroyed || active) {
      return
    }

    active = true
    runPath()
  }

  function startIdleCountdown() {
    if (destroyed) {
      return
    }

    if (idleTimer) {
      window.clearTimeout(idleTimer)
    }

    idleTimer = window.setTimeout(activate, idleDelay)
  }

  function stop() {
    active = false
    clearTimers()
    killTimeline()
  }

  function userMoved(x, y) {
    pos.x = x
    pos.y = y
    stop()
    startIdleCountdown()
  }

  function destroy() {
    destroyed = true
    stop()
  }

  return {
    startIdleCountdown,
    userMoved,
    destroy,
  }
}
