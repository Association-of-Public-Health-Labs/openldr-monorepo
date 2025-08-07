
import { ReactSVG } from "react-svg"
import { useState } from "react"
import tinycolor from "tinycolor2"

export type Props = {
  highlightedDistricts?: string[]
  onDistrictClick?: (districtName: string) => void
  customColors?: Record<string, string>
  pathDefaultBackgroundColor?: string
  pathDefaultStrokeColor?: string
  highlightedColor?: string
  districtRatios?: Record<string, number>
  defaultTextColor?: string
}

export function Niassa({ 
  highlightedDistricts = [], 
  onDistrictClick,
  customColors = {},
  pathDefaultBackgroundColor = "#00B000",
  pathDefaultStrokeColor = "#000",
  highlightedColor = "#ff0000",
  districtRatios = {},
  defaultTextColor = "#333"
}: Props) {
  const [hasError, setHasError] = useState(false)

  const handleDistrictClick = (districtName: string) => {
    onDistrictClick?.(districtName)
  }

  // Function to get contrasting text color with preference for dark text on low ratios
  const getContrastColor = (backgroundColor: string, ratio: number = 0): string => {
    const color = tinycolor(backgroundColor)
    
    // For very low ratios (0.3 or less), prefer dark text
    if (ratio <= 0.3) {
      return "#333"
    }
    
    // For higher ratios, use standard contrast logic
    return color.isLight() ? "#333" : "#fff"
  }

  // Function to get the actual background color of a district
  const getDistrictBackgroundColor = (districtClass: string): string => {
    const ratio = districtRatios[districtClass] || 0
    
    if (customColors[districtClass]) {
      return customColors[districtClass]
    } else if (ratio === 0) {
      return pathDefaultBackgroundColor
    } else {
      return highlightedColor
    }
  }

  const customizeSvg = (svg: SVGElement) => {
    // Customize paths (districts)
    const paths = svg.querySelectorAll('path')
    paths.forEach(path => {
      const districtClass = path.getAttribute('class')
      if (districtClass) {
        // Add click handler
        path.style.cursor = 'pointer'
        path.addEventListener('click', () => {
          if (districtClass.includes('MZ0100')) {
            const districtName = getDistrictName(districtClass)
            handleDistrictClick(districtName)
          }
        })

        // Set stroke
        path.setAttribute('stroke', pathDefaultStrokeColor)
        path.setAttribute('stroke-width', '1')

        // Apply ratio-based opacity and color
        const ratio = districtRatios[districtClass] || 0
        const opacity = Math.max(0.1, ratio) // Minimum 10% opacity
        
        if (customColors[districtClass]) {
          // Use custom color with ratio opacity
          path.setAttribute('fill', customColors[districtClass])
          path.setAttribute('fill-opacity', opacity.toString())
        } else if (ratio === 0) {
          // Use default background color when ratio is 0
          path.setAttribute('fill', pathDefaultBackgroundColor)
          path.setAttribute('fill-opacity', '1')
        } else {
          // Use highlighted color with ratio opacity
          path.setAttribute('fill', highlightedColor)
          path.setAttribute('fill-opacity', opacity.toString())
        }

        // Highlight selected districts
        if (highlightedDistricts.includes(districtClass)) {
          path.setAttribute('fill', highlightedColor)
          path.setAttribute('fill-opacity', '1')
          path.setAttribute('stroke-width', '2')
        }
      }
    })

    // Customize texts with contrast colors
    const texts = svg.querySelectorAll('text')
    texts.forEach(text => {
      text.style.fontSize = '12px'
      text.style.fontWeight = 'bold'
      
      // Make text clickable
      text.style.cursor = 'pointer'
      text.addEventListener('click', () => {
        const textContent = text.textContent
        if (textContent) {
          handleDistrictClick(textContent)
        }
      })

      // Find the corresponding district path for this text
      const textContent = text.textContent
      if (textContent) {
        // Find the district class that corresponds to this text
        const districtClass = findDistrictClassByText(textContent)
        if (districtClass) {
          const bgColor = getDistrictBackgroundColor(districtClass)
          const ratio = districtRatios[districtClass] || 0
          const contrastColor = getContrastColor(bgColor, ratio)
          text.style.fill = contrastColor
        } else {
          // Fallback to default color if no district found
          text.style.fill = defaultTextColor
        }
      } else {
        text.style.fill = defaultTextColor
      }
    })
  }

  // Function to find district class by text content
  const findDistrictClassByText = (textContent: string): string | null => {
    const districtMap: Record<string, string> = {
      "MZ0100N1": "Cidade de Lichinga",
      "MZ0100N2": "Cuamba",
      "MZ0100N3": "Lago",
      "MZ0100N4": "Chimbonila",
      "MZ0100N5": "Majune",
      "MZ0100N6": "Mandimba",
      "MZ0100N7": "Marrupa",
      "MZ0100N8": "Maua",
      "MZ0100N9": "Mavago",
      "MZ0100O1": "Mecanhelas",
      "MZ0100O2": "Mecula",
      "MZ0100O3": "Metarica",
      "MZ0100O4": "Muembe",
      "MZ0100O5": "Ngauma",
      "MZ0100O6": "Nipepe",
      "MZ0100O7": "Sanga",
    }

    // Find the district class that matches this text
    for (const [className, districtName] of Object.entries(districtMap)) {
      if (districtName.toLowerCase() === textContent.toLowerCase()) {
        return className
      }
    }
    return null
  }

  const getDistrictName = (className: string): string => {
    // Map class names to district names
    const districtMap: Record<string, string> = {
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
    return districtMap[className] || className
  }

  if (hasError) {
    return <div className="text-red-500">Failed to load map</div>
  }

  return (
    <div>
      <ReactSVG
        src="/niassa.svg"
        onError={() => setHasError(true)}
        afterInjection={customizeSvg}
        beforeInjection={(svg) => {
          svg.setAttribute('width', '100%')
          svg.setAttribute('height', 'auto')
        }}
      />
    </div>
  )
}