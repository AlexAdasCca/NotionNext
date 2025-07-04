/* eslint-disable no-undef */
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isMobile, loadExternalResource } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

/**
 * 网页动画
 * @returns
 */
export default function Live2D() {
  const { theme, switchTheme } = useGlobal()
  const showPet = JSON.parse(siteConfig('WIDGET_PET'))
  const petLink = siteConfig('WIDGET_PET_LINK')
  const petSwitchTheme = siteConfig('WIDGET_PET_SWITCH_THEME')
  const width = siteConfig('WIDGET_PET_WIDTH') || 280 // 默认挂件宽度
  const height = siteConfig('WIDGET_PET_HEIGHT') || 250 // 默认挂件高度

  // 挂件拖拽
  const canvasRef = useRef(null)
  const [position, setPosition] = useState({ x: window.innerWidth - width - 30, y: window.innerHeight - height - 60 })
  const isDragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  // 加载 Live2D 模型
  useEffect(() => {
    if (showPet && !isMobile()) {
      Promise.all([
        loadExternalResource(
          'https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js',
          'js'
        )
      ]).then(e => {
        if (typeof window?.loadlive2d !== 'undefined') {
          // https://github.com/xiazeyu/live2d-widget-models
          try {
            loadlive2d('live2d', petLink)
          } catch (error) {
            console.error('读取PET模型', error)
          }
        }
      })
    }
  }, [theme])

  // 拖动事件绑定
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

  // 点击事件
  function handleClick() {
    if (petSwitchTheme) {
      switchTheme()
    }
  }

  if (!showPet) {
    return <></>
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
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    />
  )
}
