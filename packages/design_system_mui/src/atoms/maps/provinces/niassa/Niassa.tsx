
import { ReactSVG } from "react-svg"
import { useState, useCallback, useRef, useMemo } from "react"
import tinycolor from "tinycolor2"
import { useTheme } from "@mui/material/styles"
import { Box, Typography } from "@mui/material"

// Types
export type NiassaProps = {
  highlightedDistricts?: string[]
  onDistrictClick?: (districtName: string) => void
  customColors?: Record<string, string>
  pathDefaultBackgroundColor?: string
  pathDefaultStrokeColor?: string
  highlightedColor?: string
  districtRatios?: Record<string, number>
  defaultTextColor?: string
  showPopover?: boolean
  getPopoverContent?: (districtName: string, ratio: number, color: string) => React.ReactNode,
  legend?: string
}

type PopoverContent = {
  name: string
  ratio: number
}

type MousePosition = {
  x: number
  y: number
}

// Constants
const DISTRICT_MAP: Record<string, string> = {
  'MZ0100N1': 'Cidade de Lichinga',
  'MZ0100N2': 'Cuamba',
  'MZ0100N3': 'Lago',
  'MZ0100N4': 'Chimbonila',
  'MZ0100N5': 'Majune',
  'MZ0100N6': 'Mandimba',
  'MZ0100N7': 'Marrupa',
  'MZ0100N8': 'Maua',
  'MZ0100N9': 'Mavago',
  'MZ0100O1': 'Mecanhelas',
  'MZ0100O2': 'Mecula',
  'MZ0100O3': 'Metarica',
  'MZ0100O4': 'Muembe',
  'MZ0100O5': 'Ngauma',
  'MZ0100O6': 'Nipepe',
  'MZ0100O7': 'Sanga',
}

const MOUSE_MOVE_DELAY = 16 // ~60fps
const MIN_OPACITY = 0.1
const LOW_RATIO_THRESHOLD = 0.3

export function Niassa({ 
  highlightedDistricts = [], 
  onDistrictClick,
  customColors = {},
  pathDefaultBackgroundColor = "#00B000",
  pathDefaultStrokeColor = "#000",
  highlightedColor = "#00B000",
  districtRatios = {},
  defaultTextColor = "#333",
  showPopover = true,
  getPopoverContent,
  legend
}: NiassaProps) {
  const theme = useTheme()
  
  // State
  const [hasError, setHasError] = useState(false)
  const [popoverContent, setPopoverContent] = useState<PopoverContent | null>(null)
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null)
  // Add this state to track if mouse is over the map
  const [isMouseOverMap, setIsMouseOverMap] = useState(false)
  
  // Refs
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isPopoverVisible = useRef(false)

  // Memoized values
  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode])

  // Event handlers
  const handleDistrictClick = useCallback((districtName: string) => {
    onDistrictClick?.(districtName)
  }, [onDistrictClick])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current)
    }
    
    mouseMoveTimeoutRef.current = setTimeout(() => {
      if (isPopoverVisible.current) {
        setMousePosition({ x: event.clientX, y: event.clientY })
      }
    }, MOUSE_MOVE_DELAY)
  }, [])

  const handleMouseEnter = useCallback((event: MouseEvent, districtName: string, ratio: number) => {
    if (showPopover) {
      isPopoverVisible.current = true
      setPopoverContent({ name: districtName, ratio })
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }, [showPopover])

  // Add these handlers for the map container
  const handleMapMouseEnter = useCallback(() => {
    setIsMouseOverMap(true)
  }, [])

  const handleMapMouseLeave = useCallback(() => {
    setIsMouseOverMap(false)
    // Also hide popover when leaving map
    isPopoverVisible.current = false
    setPopoverContent(null)
    setMousePosition(null)
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current)
    }
  }, [])

  // Update the handleMouseLeave to check if mouse is still over map
  const handleMouseLeave = useCallback(() => {
    if (!isMouseOverMap) {
      isPopoverVisible.current = false
      setPopoverContent(null)
      setMousePosition(null)
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current)
      }
    }
  }, [isMouseOverMap])

  // Utility functions
  const getContrastColor = useCallback((backgroundColor: string, ratio: number = 0): string => {
    if (isDarkMode) return "#fff"
    
    const color = tinycolor(backgroundColor)
    return ratio <= LOW_RATIO_THRESHOLD ? "#333" : (color.isLight() ? "#333" : "#fff")
  }, [isDarkMode])

  const getDistrictBackgroundColor = useCallback((districtClass: string): string => {
    const ratio = districtRatios[districtClass] || 0
    
    if (customColors[districtClass]) return customColors[districtClass]
    if (ratio === 0) return pathDefaultBackgroundColor
    return highlightedColor
  }, [districtRatios, customColors, pathDefaultBackgroundColor, highlightedColor])

  const getDistrictName = useCallback((className: string): string => {
    return DISTRICT_MAP[className] || className
  }, [])

  const findDistrictClassByText = useCallback((textContent: string): string | null => {
    for (const [className, districtName] of Object.entries(DISTRICT_MAP)) {
      if (districtName.toLowerCase() === textContent.toLowerCase()) {
        return className
      }
    }
    return null
  }, [])

  // SVG customization
  const customizeSvg = useCallback((svg: SVGElement) => {
    customizePaths(svg)
    customizeTexts(svg)
  }, [districtRatios, highlightedDistricts, highlightedColor, pathDefaultBackgroundColor, pathDefaultStrokeColor, customColors, theme, defaultTextColor])

  const customizePaths = useCallback((svg: SVGElement) => {
    const paths = svg.querySelectorAll('path')
    paths.forEach(path => {
      const districtClass = path.getAttribute('class')
      if (!districtClass) return

      const ratio = districtRatios[districtClass] || 0
      const districtName = getDistrictName(districtClass)
      
      addPathEventListeners(path as any, districtClass, districtName, ratio)
      applyPathStyling(path, districtClass, ratio)
    })
  }, [districtRatios, highlightedDistricts, highlightedColor, pathDefaultBackgroundColor, pathDefaultStrokeColor, customColors, getDistrictName])

  const customizeTexts = useCallback((svg: SVGElement) => {
    const texts = svg.querySelectorAll('text')
    texts.forEach(text => {
      addTextEventListeners(text as any)
      applyTextStyling(text as any)
    })
  }, [districtRatios, theme, defaultTextColor, getDistrictBackgroundColor, getContrastColor, findDistrictClassByText])

  const addPathEventListeners = useCallback((path: HTMLElement, districtClass: string, districtName: string, ratio: number) => {
    path.style.cursor = 'pointer'
    
    path.addEventListener('click', () => {
      if (districtClass.includes('MZ0100')) {
        handleDistrictClick(districtName)
      }
    })
    
    path.addEventListener('mouseenter', (event) => {
      handleMouseEnter(event, districtName, ratio)
    })
    
    path.addEventListener('mousemove', handleMouseMove)
    path.addEventListener('mouseleave', handleMouseLeave)
  }, [handleDistrictClick, handleMouseEnter, handleMouseMove, handleMouseLeave])

  const applyPathStyling = useCallback((path: Element, districtClass: string, ratio: number) => {
    path.setAttribute('stroke', pathDefaultStrokeColor)
    path.setAttribute('stroke-width', '1')

    const opacity = Math.max(MIN_OPACITY, ratio)
    
    if (customColors[districtClass]) {
      path.setAttribute('fill', customColors[districtClass])
      path.setAttribute('fill-opacity', opacity.toString())
    } else if (ratio === 0) {
      path.setAttribute('fill', pathDefaultBackgroundColor)
      path.setAttribute('fill-opacity', '1')
    } else {
      path.setAttribute('fill', highlightedColor)
      path.setAttribute('fill-opacity', opacity.toString())
    }

    if (highlightedDistricts.includes(districtClass)) {
      path.setAttribute('fill', highlightedColor)
      path.setAttribute('fill-opacity', '1')
      path.setAttribute('stroke-width', '2')
    }
  }, [customColors, pathDefaultBackgroundColor, pathDefaultStrokeColor, highlightedColor, highlightedDistricts])

  const addTextEventListeners = useCallback((text: HTMLElement) => {
    text.style.cursor = 'pointer'
    text.addEventListener('click', () => {
      const textContent = text.textContent
      if (textContent) {
        handleDistrictClick(textContent)
      }
    })
  }, [handleDistrictClick])

  const applyTextStyling = useCallback((text: HTMLElement) => {
    text.style.fontSize = '14px'
    text.style.fontWeight = 'bold'
    
    const textContent = text.textContent
    if (!textContent) {
      text.style.fill = isDarkMode ? "#fff" : defaultTextColor
      return
    }

    const districtClass = findDistrictClassByText(textContent)
    if (districtClass) {
      const bgColor = getDistrictBackgroundColor(districtClass)
      const ratio = districtRatios[districtClass] || 0
      const contrastColor = getContrastColor(bgColor, ratio)
      text.style.fill = contrastColor
    } else {
      text.style.fill = isDarkMode ? "#fff" : defaultTextColor
    }
  }, [isDarkMode, defaultTextColor, findDistrictClassByText, getDistrictBackgroundColor, getContrastColor, districtRatios])

  // Render
  if (hasError) {
    return <div className="text-red-500">Failed to load map</div>
  }

  return (
    <div 
      onMouseEnter={handleMapMouseEnter}
      onMouseLeave={handleMapMouseLeave}
    >
      <ReactSVG
        src="https://res.cloudinary.com/dduwau07t/image/upload/v1754590722/samples/niassa_ucp2fd.svg"
        onError={(error) => {
          console.log("error", error)
          setHasError(true)
        }}
        afterInjection={customizeSvg}
        beforeInjection={(svg) => {
          svg.setAttribute('width', '100%')
          svg.setAttribute('height', 'auto')
        }}
      />
      
      {/* Only show popover if mouse is over map */}
      {isMouseOverMap && mousePosition && popoverContent && (
        <Box
          sx={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            backgroundColor: "background.default",
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '16px',
            boxShadow: theme.shadows[4],
            minWidth: 150,
            zIndex: 1000,
            pointerEvents: 'none',
            transform: 'translateZ(0)',
          }}
        >
          {getPopoverContent ? (
            getPopoverContent(popoverContent.name, popoverContent.ratio, highlightedColor)
          ) : (
              <Box>
                <Box sx={{
                  backgroundColor: "background.paper",
                  p: 1,
                  textAlign: "center",
                }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {popoverContent.name}
                  </Typography>
                </Box>
                <Box sx={{
                  paddingX: 2,
                  paddingY: 1.5,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}>
                  <Box sx={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: highlightedColor,
                    borderRadius: "50%",
                  }}>
                  </Box>
                  <Typography variant="body2" color="text.primary">
                    {legend}: {(popoverContent.ratio * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
          )}
        </Box>
      )}
    </div>
  )
}