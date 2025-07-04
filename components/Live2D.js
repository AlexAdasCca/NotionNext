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
  const popupMode = siteConfig('WIDGET_PET_POPUP_MODE') === true

  const canvasRef = useRef(null)
  const [position, setPosition] = useState({
    x: window.innerWidth - width - 30,
    y: window.innerHeight - height - 60
  })
  const isDragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  // 弹出式：挂载到 body
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
        console.error('加载Live2D模型失败:', error)
      }
    })

    // 拖动 & 交互
    const handleMouseDown = (e) => {
      if (e.target !== canvas) return
      isDragging.current = true
      const rect = canvas.getBoundingClientRect()
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleMouseMove = (e) => {
      if (!isDragging.current) return
      const newX = e.clientX - offset.current.x
      const newY = e.clientY - offset.current.y
      canvas.style.left = `${newX}px`
      canvas.style.top = `${newY}px`
    }

    const handleMouseUp = () => (isDragging.current = false)
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

  // 内嵌式：React 渲染组件
  if (!showPet || isMobile() || popupMode) return null

  // 拖动逻辑（内嵌模式）
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return
      const newX = e.clientX - offset.current.x
      const newY = e.clientY - offset.current.y
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  function handleMouseDown(e) {
    isDragging.current = true
    const rect = canvasRef.current.getBoundingClientRect()
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  function handleClick() {
    if (petSwitchTheme) switchTheme()
  }

  return (
    <canvas
      id='live2d'
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className='cursor-move'
    />
  )
}
