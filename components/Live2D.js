/* eslint-disable no-undef */
/* eslint-disable no-undef */
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isMobile, loadExternalResource } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export default function Live2D() {
  const { theme, switchTheme } = useGlobal()
  const showPet = JSON.parse(siteConfig('WIDGET_PET'))
  const petLink = siteConfig('WIDGET_PET_LINK')
  const petSwitchTheme = siteConfig('WIDGET_PET_SWITCH_THEME')
  const width = siteConfig('WIDGET_PET_WIDTH') || 280
  const height = siteConfig('WIDGET_PET_HEIGHT') || 250
  const scale = siteConfig('WIDGET_PET_SCALE') || 1.0
  const popupMode = siteConfig('WIDGET_PET_POPUP_MODE') === true

  const canvasRef = useRef(null)
  const isDragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  // 初始位置
  const [position, setPosition] = useState({
    x: window.innerWidth - width * scale - 30,
    y: window.innerHeight - height * scale - 60
  })

  useEffect(() => {
    if (!popupMode || !showPet || isMobile()) return

    const canvas = document.createElement('canvas')
    canvas.id = 'live2d-popup'
    canvas.width = width
    canvas.height = height
    canvas.style.position = 'fixed'
    canvas.style.left = `${position.x}px`
    canvas.style.top = `${position.y}px`
    canvas.style.zIndex = '99999'
    canvas.style.pointerEvents = 'auto'
    canvas.style.cursor = 'move'
    canvas.style.transformOrigin = 'bottom right'
    canvas.style.transform = `scale(${scale})`

    document.body.appendChild(canvas)
    canvasRef.current = canvas

    // 加载模型
    loadExternalResource(
      'https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js',
      'js'
    ).then(() => {
      try {
        window.loadlive2d('live2d-popup', petLink)
      } catch (error) {
        console.error('加载 Live2D 模型失败:', error)
      }
    })

    // 拖动事件
    const handleMouseDown = (e) => {
      if (e.target !== canvas) return
      isDragging.current = true
      const rect = canvas.getBoundingClientRect()
      offset.current = {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      }
    }

    const handleMouseMove = (e) => {
      if (!isDragging.current || !canvasRef.current) return
    
      const canvas = canvasRef.current
    
      const newX = e.clientX - offset.current.x
      const newY = e.clientY - offset.current.y
    
      const clampedX = Math.max(0, Math.min(newX, window.innerWidth - width * scale))
      const clampedY = Math.max(0, Math.min(newY, window.innerHeight - height * scale))
    
      canvas.style.left = `${clampedX}px`
      canvas.style.top = `${clampedY}px`
    
      setPosition({ x: clampedX, y: clampedY })
    }    

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleClick = () => {
      if (petSwitchTheme) switchTheme()
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('click', handleClick)

    // 清理
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.removeChild(canvas)
    }
  }, [theme])

  // 内嵌模式
  if (!showPet || isMobile() || popupMode) return null

  function handleClick() {
    if (petSwitchTheme) switchTheme()
  }

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        transformOrigin: 'bottom right'
      }}
    >
      <canvas
        id='live2d'
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className='cursor-pointer'
      />
    </div>
  )
}
