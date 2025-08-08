import {
  useEffect, useState, useCallback, useRef, useMemo} from "react";
import styled from "styled-components";
import {grey} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export type InteractiveSvgMapShowIndicatorsProps = {
  0: boolean,
  1: boolean,
}

type ValuesProps = {
  0: string | number;
  1: string | number;
}

export interface InteractiveSvgMapProvinceProps {
  highlighted?: boolean;
  highlightedColor?: string;
  ratio?: number
}

export interface InteractiveSvgMapProvincesProps {
  mc?: InteractiveSvgMapProvinceProps,
  mp?: InteractiveSvgMapProvinceProps,
  gz?: InteractiveSvgMapProvinceProps,
  ib?: InteractiveSvgMapProvinceProps,
  mn?: InteractiveSvgMapProvinceProps,
  sf?: InteractiveSvgMapProvinceProps,
  tt?: InteractiveSvgMapProvinceProps,
  zb?: InteractiveSvgMapProvinceProps,
  np?: InteractiveSvgMapProvinceProps,
  ns?: InteractiveSvgMapProvinceProps,
  cd?: InteractiveSvgMapProvinceProps,
}

interface OptionsProps {
  tooltip?: boolean;
}

export interface InteractiveSvgMapProps {
  options?: OptionsProps;
  provinces?: InteractiveSvgMapProvincesProps;
  width?: number | string;
  height?: number | string;
  pathDefaultBackgroundColor?: string;
  showIndicators?: InteractiveSvgMapShowIndicatorsProps;
  onClick?: (value) => void;
  highlightedColor?: string;
  hideNames?: boolean;
  useShortName?: boolean;
  showPopover?: boolean;
  getPopoverContent?: (provinceName: string, ratio: number, color: string) => React.ReactNode;
}

// Types for popover
type PopoverContent = {
  name: string
  ratio: number
}

type MousePosition = {
  x: number
  y: number
}

const MOUSE_MOVE_DELAY = 16 // ~60fps

export const InteractiveSvgMap = ({
  options = {
    tooltip: true,
  },
  provinces, 
  height="400px", 
  width="300px",
  pathDefaultBackgroundColor,
  showIndicators,
  onClick,
  highlightedColor,
  hideNames=false,
  useShortName,
  showPopover = true,
  getPopoverContent
}: InteractiveSvgMapProps) => {
  const theme = useTheme(); // @ts-ignore
  const color = highlightedColor || theme.palette.primary.main; // @ts-ignore
  const themeColor = color
  const backgroundColor = theme.palette?.background.paper;
  const [loadMap, setLoadMap] = useState(false)

  // Popover state
  const [popoverContent, setPopoverContent] = useState<PopoverContent | null>(null)
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null)
  const [isMouseOverMap, setIsMouseOverMap] = useState(false)
  
  // Refs
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isPopoverVisible = useRef(false)

  // Memoized values
  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode])

  // Popover event handlers
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

  const handleMouseEnter = useCallback((event: MouseEvent, provinceName: string, ratio: number) => {
    if (showPopover) {
      isPopoverVisible.current = true
      setPopoverContent({ name: provinceName, ratio })
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }, [showPopover])

  const handleMapMouseEnter = useCallback(() => {
    setIsMouseOverMap(true)
  }, [])

  const handleMapMouseLeave = useCallback(() => {
    setIsMouseOverMap(false)
    isPopoverVisible.current = false
    setPopoverContent(null)
    setMousePosition(null)
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current)
    }
  }, [])

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

  // Function to add popover events to SVG paths
  const addPopoverEvents = useCallback((svgElement: SVGElement) => {
    const paths = svgElement.querySelectorAll('path')
    paths.forEach(path => {
      const provinceId = path.getAttribute('id')
      if (!provinceId) return

      const provinceData = provinces?.[provinceId as keyof InteractiveSvgMapProvincesProps]
      const ratio = provinceData?.ratio || 0
      const provinceName = getProvinceName(provinceId)
      
      // Add mouse events for popover
      path.addEventListener('mouseenter', (event) => {
        handleMouseEnter(event, provinceName, ratio)
      })
      
      path.addEventListener('mousemove', handleMouseMove)
      path.addEventListener('mouseleave', handleMouseLeave)
    })
  }, [provinces, handleMouseEnter, handleMouseMove, handleMouseLeave])

  // Helper function to get province name
  const getProvinceName = useCallback((provinceId: string): string => {
    const provinceMap: Record<string, string> = {
      'np': 'Nampula',
      'ib': 'Inhambane',
      'mc': 'Maputo Cidade',
      'zb': 'Zambezia',
      'mp': 'Maputo Provincia',
      'tt': 'Tete',
      'mn': 'Manica',
      'cd': 'Cabo Delgado',
      'ns': 'Niassa',
      'gz': 'Gaza',
      'sf': 'Sofala'
    }
    return provinceMap[provinceId] || provinceId
  }, [])

  useEffect(() => {
    const onPageLoad = () => {
      setLoadMap(true)
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  // Add popover events after map loads
  useEffect(() => {
    if (loadMap) {
      const svgElement = document.querySelector('#admin1')?.closest('svg') as SVGElement
      if (svgElement) {
        addPopoverEvents(svgElement)
      }
    }
  }, [loadMap, addPopoverEvents])

  return (
    <Container 
      width={width} 
      height={height}
      onMouseEnter={handleMapMouseEnter}
      onMouseLeave={handleMapMouseLeave}
    >
      {loadMap && 
        <MapSvg 
          xmlns="http://www.w3.org/2000/svg" 
          theme={theme}
        >
          <g id="admin1">
            <path
              className={`${provinces?.np?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="np"
              style={{opacity: provinces?.np?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M402.8,256.0 L399.9,255.1 L400.0,251.2 L404.7,250.5 Z M430.0,131.4 L433.1,131.6 L435.9,134.1 L433.5,137.1 L434.8,141.4 L435.3,146.5 L437.0,150.1 L437.6,154.3 L435.2,156.6 L435.7,158.9 L432.7,159.9 L436.1,163.7 L436.1,162.5 L439.3,160.9 L441.3,164.8 L440.6,167.8 L438.6,168.9 L436.6,167.6 L437.3,172.4 L435.8,174.1 L435.9,177.4 L438.8,172.0 L441.7,170.6 L445.1,173.3 L443.9,175.5 L443.5,179.7 L444.9,183.7 L444.3,187.9 L439.5,191.4 L436.5,192.2 L440.3,193.0 L440.8,195.7 L437.1,195.2 L438.7,199.4 L434.9,200.4 L434.0,201.7 L431.1,201.2 L430.1,203.9 L433.0,204.9 L434.2,203.1 L436.3,203.9 L437.1,206.3 L436.4,209.2 L434.6,211.1 L432.4,215.7 L432.9,216.8 L425.8,222.5 L423.1,226.7 L414.4,235.1 L412.6,236.0 L413.1,238.1 L411.7,241.4 L406.8,248.1 L402.7,248.7 L398.0,251.2 L399.4,255.8 L394.1,261.0 L387.0,265.3 L379.6,268.8 L369.9,274.9 L370.0,272.9 L366.5,266.2 L364.5,264.9 L364.3,261.4 L366.8,260.3 L366.7,256.3 L362.1,246.1 L363.0,242.0 L360.2,236.3 L358.0,229.6 L352.8,223.2 L347.4,220.7 L340.1,213.7 L332.8,211.9 L330.5,208.1 L324.3,204.7 L322.7,202.9 L320.2,203.0 L318.2,200.9 L311.4,203.0 L305.0,198.2 L301.4,201.1 L298.9,201.8 L296.3,199.5 L294.6,195.2 L292.2,192.8 L271.3,192.1 L276.4,186.4 L278.8,182.4 L283.4,179.1 L287.5,177.4 L290.7,174.8 L293.6,175.3 L297.9,173.0 L304.4,166.5 L307.7,166.6 L310.2,164.0 L309.9,162.3 L312.1,161.3 L315.4,161.7 L317.9,159.7 L319.7,159.7 L323.0,163.0 L325.8,161.2 L332.9,160.0 L336.9,157.1 L343.5,155.8 L349.3,157.0 L355.6,156.8 L361.3,155.3 L366.8,152.0 L369.8,151.3 L372.4,148.5 L376.9,149.1 L380.9,146.7 L387.3,144.1 L388.7,142.1 L393.5,140.0 L397.2,139.4 L399.7,137.7 L404.2,137.9 L411.7,131.0 L416.3,128.4 L421.5,130.3 L428.7,129.1 Z"
              onClick={() => onClick && onClick({key: "Nampula", ...provinces?.np})}
            />
            <path
              className={`${provinces?.ib?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              d="M214.7,482.5 L213.6,481.1 L215.5,472.6 L216.3,471.8 L216.3,476.6 Z M201.5,446.7 L200.0,452.4 L197.9,452.4 L199.2,457.2 L200.3,458.5 L199.6,462.6 L201.2,461.2 L201.5,465.0 L202.8,468.3 L207.4,476.5 L207.3,482.1 L208.8,486.6 L209.7,495.7 L208.4,506.7 L208.6,509.6 L211.8,512.9 L213.2,509.4 L211.8,503.6 L214.0,497.1 L215.4,495.9 L216.2,498.0 L216.9,505.3 L218.3,499.7 L217.8,509.6 L215.7,516.2 L215.5,521.6 L216.6,531.0 L220.0,531.3 L214.7,542.5 L214.7,548.6 L212.3,555.5 L211.1,566.6 L209.6,564.7 L208.7,576.3 L210.6,574.1 L210.9,571.1 L213.9,572.4 L214.1,568.6 L216.2,569.5 L216.7,572.1 L214.3,579.5 L214.6,582.7 L206.9,593.9 L202.4,598.7 L202.0,600.5 L199.0,603.4 L187.4,609.4 L180.9,612.4 L174.3,614.0 L173.1,611.8 L168.2,611.1 L167.2,607.8 L173.6,604.3 L170.4,600.1 L172.3,597.1 L167.5,598.1 L161.1,600.4 L155.7,591.5 L155.4,580.9 L152.7,580.8 L153.1,566.8 L154.3,564.2 L151.6,562.4 L153.8,559.5 L153.3,556.2 L151.8,555.7 L150.1,550.2 L152.2,549.2 L151.0,548.1 L149.7,542.6 L148.3,540.2 L143.4,535.3 L143.1,532.9 L138.5,527.0 L133.9,523.5 L128.6,516.2 L128.0,514.0 L129.0,508.4 L131.1,507.0 L130.5,500.5 L131.1,495.8 L129.5,491.2 L126.8,489.0 L122.7,483.8 L122.1,478.7 L122.9,476.4 L126.8,471.6 L127.4,469.9 L132.4,468.6 L136.0,465.9 L139.1,465.2 L152.0,465.8 L154.4,462.3 L157.1,461.7 L161.7,461.3 L163.4,462.2 L166.3,459.9 L169.8,461.7 L175.2,455.8 L183.8,452.5 L185.9,454.2 L191.8,449.7 L196.0,448.0 Z"
              id="ib"
              style={{opacity: provinces?.ib?.ratio || 0, fill: pathDefaultBackgroundColor}}
              onClick={() => onClick && onClick({key: "Inhambane", ...provinces?.ib})}
            />

            <path
              className={`${provinces?.mc?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="mc"
              style={{opacity: provinces?.mc?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M115.3,663.4 L114.3,665.3 L112.2,664.2 L115.6,661.6 Z M121.4,636.3 L111.3,643.4 L107.3,649.3 L105.9,654.6 L103.0,659.1 L98.9,657.2 L97.5,660.9 L102.7,667.0 L103.9,671.1 L107.0,671.7 L110.1,675.4 L111.6,674.9 L111.2,672.4 L112.2,667.9 L114.5,666.4 L113.5,674.4 L113.1,686.4 L112.1,691.1 L112.1,699.3 L91.3,700.0 L82.1,699.2 L82.1,688.1 L81.7,684.6 L79.9,680.9 L79.0,675.3 L80.6,669.5 L79.7,664.9 L80.2,663.5 L75.4,661.3 L73.9,656.4 L73.9,653.9 L75.5,649.6 L77.0,648.1 L75.9,640.8 L76.8,636.2 L76.3,601.6 L76.4,595.4 L74.0,589.1 L79.5,586.3 L83.7,586.9 L87.6,588.4 L92.3,589.0 L95.7,592.2 L99.5,593.8 L101.8,593.2 L104.7,594.5 L105.1,600.0 L109.3,606.1 L109.8,608.1 L113.8,611.1 L113.2,613.5 L113.4,621.6 L115.7,622.8 L116.4,628.8 L121.0,630.2 L121.7,632.5 Z"
              onClick={() => onClick && onClick({key: "Maputo Cidade", ...provinces?.mc})}
            />

            <path
              className={`${provinces?.zb?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="zb"
              style={{opacity: provinces?.zb?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M369.9,274.9 L368.2,279.7 L363.2,280.1 L359.2,282.1 L352.7,282.5 L347.5,283.9 L331.9,289.9 L329.8,291.7 L328.4,290.6 L328.4,287.7 L326.1,287.4 L327.9,291.6 L324.2,293.3 L318.8,294.3 L311.0,299.0 L309.7,298.9 L294.7,307.8 L292.6,308.1 L284.3,315.6 L280.0,321.7 L275.5,316.7 L276.8,321.7 L279.7,323.2 L275.8,329.2 L274.2,329.6 L270.8,333.9 L258.8,345.5 L255.5,351.3 L256.0,354.0 L253.6,355.2 L251.0,354.1 L248.8,350.4 L249.7,356.3 L248.9,358.5 L244.9,359.2 L244.4,355.2 L246.8,353.2 L244.3,351.4 L243.9,346.9 L245.6,345.9 L245.3,342.9 L243.3,337.1 L240.0,333.6 L235.8,331.7 L232.8,326.7 L233.3,325.9 L229.0,322.9 L225.3,321.3 L222.8,321.4 L216.6,315.3 L215.9,312.3 L211.7,308.1 L212.1,306.3 L212.6,292.9 L211.2,288.2 L210.8,282.6 L211.9,276.3 L210.3,275.1 L211.7,270.6 L210.5,264.2 L206.2,260.9 L204.5,257.1 L208.0,254.8 L210.2,249.4 L209.9,245.7 L214.8,240.2 L218.2,239.7 L220.6,241.5 L221.2,240.2 L228.2,238.9 L231.2,236.9 L232.3,234.6 L234.4,211.1 L249.4,211.2 L252.8,212.9 L254.3,208.9 L256.9,204.7 L258.7,204.8 L265.0,202.0 L271.1,194.6 L271.3,192.1 L292.2,192.8 L294.6,195.2 L296.3,199.5 L298.9,201.8 L301.4,201.1 L305.0,198.2 L311.4,203.0 L318.2,200.9 L320.2,203.0 L322.7,202.9 L324.3,204.7 L330.5,208.1 L332.8,211.9 L340.1,213.7 L347.4,220.7 L352.8,223.2 L358.0,229.6 L360.2,236.3 L363.0,242.0 L362.1,246.1 L366.7,256.3 L366.8,260.3 L364.3,261.4 L364.5,264.9 L366.5,266.2 L370.0,272.9 Z"
              onClick={() => onClick && onClick({key: "Zambezia", ...provinces?.zb})}
            />

            <path
              className={`${provinces?.mp?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="mp"
              style={{opacity: provinces?.mp?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M103.0,659.1 L100.4,661.7 L97.5,660.9 L98.9,657.2 Z"
              onClick={() => onClick && onClick({key: "Maputo Provincia", ...provinces?.mp})}
            />

            <path
              className={`${provinces?.tt?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="tt"
              style={{opacity: provinces?.tt?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M116.7,293.0 L115.1,289.3 L114.3,283.7 L109.2,273.7 L113.5,268.6 L114.9,262.8 L111.8,264.1 L103.8,263.0 L102.7,259.3 L86.9,253.0 L83.6,252.5 L75.4,252.8 L71.1,252.1 L69.0,248.3 L61.8,242.6 L54.8,242.2 L50.1,240.8 L44.0,234.9 L37.9,233.8 L32.1,236.6 L27.3,233.9 L8.4,234.3 L7.9,218.6 L6.7,215.4 L7.6,212.4 L6.7,207.4 L5.2,204.4 L3.2,203.3 L0.5,195.9 L0.0,190.6 L4.3,189.9 L11.3,186.3 L25.0,181.1 L49.8,175.1 L60.2,170.2 L83.9,162.3 L124.7,148.3 L128.0,150.3 L128.4,154.5 L131.1,157.4 L134.6,164.1 L141.5,170.2 L143.2,173.6 L146.4,168.8 L148.6,170.5 L153.4,168.7 L160.2,169.1 L161.3,167.3 L165.7,166.7 L172.5,164.5 L179.0,172.6 L179.1,178.0 L180.7,182.1 L180.9,186.6 L182.3,190.2 L180.8,193.3 L181.6,202.5 L178.6,206.4 L177.9,208.6 L174.9,211.5 L174.6,218.6 L172.0,222.2 L168.1,224.9 L167.5,229.0 L173.8,235.3 L174.7,237.5 L173.7,241.8 L176.2,246.4 L179.4,246.7 L181.5,250.6 L184.8,254.8 L188.0,256.6 L199.1,268.9 L202.9,269.1 L204.2,271.1 L203.6,275.2 L200.3,278.5 L202.2,282.3 L210.8,282.6 L211.2,288.2 L212.6,292.9 L212.1,306.3 L211.7,308.1 L207.7,305.7 L203.0,301.3 L202.2,298.1 L197.4,286.4 L195.0,281.8 L193.1,275.8 L189.4,272.6 L182.2,269.5 L174.5,265.1 L166.7,263.7 L163.2,261.2 L158.3,260.7 L157.7,259.1 L154.1,257.4 L150.3,251.8 L147.9,251.0 L144.9,251.9 L140.7,251.5 L137.2,252.8 L134.6,255.9 L134.6,259.4 L129.5,265.4 L129.1,268.7 L127.6,270.9 L125.9,276.4 L122.9,277.8 L120.7,280.3 L120.1,285.8 Z"
              onClick={() => onClick && onClick({key: "Tete", ...provinces?.tt})}
            />

            <path
              className={`${provinces?.mn?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="mn"
              style={{opacity: provinces?.mn?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M157.1,461.7 L154.4,462.3 L152.0,465.8 L139.1,465.2 L136.0,465.9 L132.4,468.6 L127.4,469.9 L124.3,469.2 L120.3,471.5 L119.1,473.8 L115.7,472.6 L113.1,469.1 L108.1,468.9 L103.6,465.4 L98.6,464.7 L93.9,461.5 L89.6,454.0 L94.8,447.4 L96.0,443.9 L94.8,434.8 L95.3,431.2 L96.6,429.5 L101.9,429.2 L105.5,423.1 L110.0,417.6 L111.6,409.7 L114.4,406.6 L116.5,406.6 L116.3,402.1 L117.6,396.0 L114.4,393.1 L114.7,390.6 L109.4,391.7 L109.1,382.9 L106.6,382.3 L106.8,377.9 L109.3,374.5 L110.6,367.4 L108.9,363.6 L103.6,363.0 L103.3,359.9 L104.6,358.9 L103.6,355.2 L107.6,353.4 L111.5,353.2 L113.0,350.6 L110.9,342.4 L116.1,339.5 L115.7,337.5 L117.7,333.7 L114.3,329.4 L115.1,325.9 L113.7,321.4 L113.6,314.0 L116.2,310.6 L116.5,301.4 L114.3,300.1 L113.6,297.9 L116.7,293.0 L120.1,285.8 L120.7,280.3 L122.9,277.8 L125.9,276.4 L127.6,270.9 L129.1,268.7 L129.5,265.4 L134.6,259.4 L134.6,255.9 L137.2,252.8 L140.7,251.5 L144.9,251.9 L147.9,251.0 L150.3,251.8 L154.1,257.4 L157.7,259.1 L158.3,260.7 L163.2,261.2 L166.7,263.7 L174.5,265.1 L182.2,269.5 L176.9,276.2 L169.3,279.7 L166.8,284.8 L166.7,288.1 L165.0,293.2 L164.6,297.6 L162.8,302.2 L164.0,308.5 L163.9,314.0 L168.8,316.9 L168.8,323.2 L166.6,328.9 L163.9,329.1 L162.6,330.8 L158.9,329.0 L158.1,326.7 L154.8,325.4 L154.1,327.8 L149.7,331.7 L151.0,334.9 L150.5,337.2 L151.9,340.4 L145.9,347.2 L145.9,350.3 L151.1,352.2 L154.9,357.1 L158.4,359.1 L154.0,375.7 L153.9,387.1 L150.9,387.9 L152.0,391.0 L151.8,395.8 L157.0,398.4 L155.0,399.0 L152.4,401.6 L147.9,403.6 L146.8,405.4 L143.3,402.5 L137.5,404.7 L133.0,408.6 L133.8,412.8 L135.6,413.9 L136.9,417.8 L136.1,423.3 L146.2,433.9 L151.6,436.0 L152.2,437.5 L152.4,446.3 L157.0,447.4 L161.0,450.6 L161.6,452.2 L159.4,454.2 L157.7,457.5 Z"
              onClick={() => onClick && onClick({key: "Manica", ...provinces?.mn})}
            />

            <path
              className={`${provinces?.cd?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="cd"
              style={{opacity: provinces?.cd?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M430.0,131.4 L428.7,129.1 L421.5,130.3 L416.3,128.4 L411.7,131.0 L404.2,137.9 L399.7,137.7 L397.2,139.4 L393.5,140.0 L388.7,142.1 L387.3,144.1 L380.9,146.7 L376.9,149.1 L372.4,148.5 L369.8,151.3 L366.8,152.0 L361.3,155.3 L355.6,156.8 L349.3,157.0 L343.5,155.8 L341.1,153.6 L337.8,148.2 L333.8,139.3 L333.5,136.5 L331.6,132.4 L330.8,127.3 L328.9,127.4 L328.3,125.0 L332.6,120.7 L334.6,117.5 L335.5,111.9 L332.4,113.1 L326.2,110.6 L327.1,107.6 L327.7,99.2 L328.9,94.9 L328.4,91.6 L329.2,88.3 L328.6,85.0 L334.8,79.2 L336.4,73.2 L341.6,69.4 L342.3,65.8 L345.8,61.5 L346.7,56.2 L344.7,51.9 L345.7,45.9 L347.4,41.2 L349.0,39.0 L356.0,33.2 L360.5,32.7 L366.4,28.7 L373.4,28.5 L376.2,27.7 L379.9,29.3 L383.1,28.5 L391.6,22.0 L403.5,19.8 L408.9,16.5 L414.2,14.3 L420.8,9.9 L424.7,5.9 L429.2,3.9 L433.6,0.0 L436.9,1.8 L435.4,3.6 L438.0,5.1 L439.3,8.3 L442.0,9.6 L438.3,10.0 L434.6,12.7 L440.3,16.3 L437.1,18.1 L434.9,21.1 L434.9,24.2 L437.8,23.7 L437.1,26.3 L435.1,28.6 L435.1,31.1 L431.6,33.9 L430.6,35.9 L428.2,36.6 L431.9,39.9 L433.1,39.6 L432.7,44.1 L431.1,47.3 L432.5,49.1 L431.3,50.7 L433.7,59.3 L433.4,61.7 L435.4,66.2 L433.7,71.7 L434.8,74.4 L433.2,77.1 L434.7,83.2 L432.4,87.2 L432.9,88.6 L435.8,89.3 L436.3,96.9 L439.2,99.1 L438.3,100.7 L434.0,101.7 L435.1,102.9 L433.8,105.6 L432.1,104.3 L429.2,106.2 L429.2,108.2 L431.3,110.2 L433.1,109.5 L432.3,107.5 L436.5,107.8 L435.1,113.9 L435.6,116.9 L435.0,125.4 L433.1,131.6 Z"
              onClick={() => onClick && onClick({key: "Cabo Delgado", ...provinces?.cd})}
            />

            <path
              className={`${provinces?.ns?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="ns"
              style={{opacity: provinces?.ns?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M343.5,155.8 L336.9,157.1 L332.9,160.0 L325.8,161.2 L323.0,163.0 L319.7,159.7 L317.9,159.7 L315.4,161.7 L312.1,161.3 L309.9,162.3 L310.2,164.0 L307.7,166.6 L304.4,166.5 L297.9,173.0 L293.6,175.3 L290.7,174.8 L287.5,177.4 L283.4,179.1 L278.8,182.4 L276.4,186.4 L271.3,192.1 L271.1,194.6 L265.0,202.0 L258.7,204.8 L256.9,204.7 L254.3,208.9 L252.8,212.9 L249.4,211.2 L234.4,211.1 L234.5,209.3 L232.3,199.8 L232.6,197.7 L237.5,186.6 L235.8,186.1 L235.5,177.1 L221.9,159.6 L219.1,154.1 L203.7,135.4 L195.8,128.1 L194.2,127.2 L194.4,121.2 L192.0,119.2 L192.4,115.2 L191.8,110.9 L192.6,108.7 L190.2,102.6 L191.4,96.4 L193.1,92.9 L190.2,85.5 L188.2,82.3 L187.8,70.2 L193.1,64.9 L195.2,64.0 L196.9,58.5 L198.9,54.2 L199.4,43.9 L218.8,44.2 L225.2,45.5 L228.6,44.3 L230.3,40.8 L233.3,39.9 L235.9,37.3 L240.7,38.3 L242.7,41.6 L244.2,41.4 L250.3,44.6 L251.6,49.9 L254.9,50.2 L259.2,49.1 L264.1,49.1 L267.0,51.3 L271.4,50.6 L274.8,48.7 L278.0,44.7 L281.6,45.6 L287.0,44.5 L290.0,48.5 L295.1,50.1 L299.6,49.7 L303.6,51.5 L306.9,49.4 L313.0,47.9 L318.8,44.7 L322.9,34.4 L325.6,33.0 L331.2,31.8 L334.8,33.0 L339.1,32.9 L342.9,36.5 L349.0,38.9 L347.4,41.2 L345.7,45.9 L344.7,51.9 L346.7,56.2 L345.8,61.5 L342.3,65.8 L341.6,69.4 L336.4,73.2 L334.8,79.2 L328.6,85.0 L329.2,88.3 L328.4,91.6 L328.9,94.9 L327.7,99.2 L327.1,107.6 L326.2,110.6 L332.4,113.1 L335.5,111.9 L334.6,117.5 L332.6,120.7 L328.3,125.0 L328.9,127.4 L330.8,127.3 L331.6,132.4 L333.8,139.3 L337.8,148.2 L341.1,153.6 Z"
              onClick={() => onClick && onClick({key: "Niassa", ...provinces?.ns})}
            />

            <path
              className={`${provinces?.gz?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="gz"
              style={{opacity: provinces?.gz?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M127.4,469.9 L126.8,471.6 L122.9,476.4 L122.1,478.7 L122.7,483.8 L126.8,489.0 L129.5,491.2 L131.1,495.8 L130.5,500.5 L131.1,507.0 L129.0,508.4 L128.0,514.0 L128.6,516.2 L133.9,523.5 L138.5,527.0 L143.1,532.9 L143.4,535.3 L148.3,540.2 L149.7,542.6 L151.0,548.1 L152.2,549.2 L150.1,550.2 L151.8,555.7 L153.3,556.2 L153.8,559.5 L151.6,562.4 L154.3,564.2 L153.1,566.8 L152.7,580.8 L155.4,580.9 L155.7,591.5 L161.1,600.4 L167.5,598.1 L172.3,597.1 L170.4,600.1 L173.6,604.3 L167.2,607.8 L168.2,611.1 L173.1,611.8 L174.3,614.0 L163.7,618.2 L161.5,618.5 L144.8,624.6 L139.1,627.6 L134.4,629.2 L128.6,632.4 L129.2,630.7 L124.6,632.8 L125.1,634.3 L121.4,636.3 L121.7,632.5 L121.0,630.2 L116.4,628.8 L115.7,622.8 L113.4,621.6 L113.2,613.5 L113.8,611.1 L109.8,608.1 L109.3,606.1 L105.1,600.0 L104.7,594.5 L101.8,593.2 L99.5,593.8 L95.7,592.2 L92.3,589.0 L87.6,588.4 L83.7,586.9 L79.5,586.3 L74.0,589.1 L71.7,584.3 L71.1,574.9 L66.5,570.3 L62.5,559.6 L58.6,555.5 L57.6,552.2 L58.1,541.1 L47.5,509.4 L53.6,504.4 L92.4,460.7 L93.9,461.5 L98.6,464.7 L103.6,465.4 L108.1,468.9 L113.1,469.1 L115.7,472.6 L119.1,473.8 L120.3,471.5 L124.3,469.2 Z"
              onClick={() => onClick && onClick({key: "Gaza", ...provinces?.gz})}
            />

            <path
              className={`${provinces?.sf?.highlighted && "highlighted" }`}
              strokeWidth="0.4"
              id="sf"
              style={{opacity: provinces?.sf?.ratio || 0, fill: pathDefaultBackgroundColor}}
              d="M244.4,355.2 L243.4,355.1 L240.1,359.3 L233.4,362.8 L224.9,368.9 L225.1,370.5 L220.9,373.9 L215.7,381.0 L211.5,385.3 L206.7,389.1 L202.7,393.1 L200.3,394.0 L196.8,397.2 L192.6,399.8 L190.3,396.5 L185.6,393.4 L182.4,388.2 L179.5,387.6 L178.5,389.4 L181.9,388.9 L185.0,394.6 L188.5,397.7 L187.1,400.9 L187.2,406.8 L188.3,411.4 L187.5,413.4 L183.4,413.0 L186.9,415.4 L184.3,420.5 L183.6,424.0 L185.4,424.8 L185.5,427.0 L183.7,428.8 L186.6,428.2 L187.0,429.7 L189.9,431.4 L191.1,434.5 L195.3,435.6 L196.8,437.1 L197.1,441.2 L201.5,446.7 L196.0,448.0 L191.8,449.7 L185.9,454.2 L183.8,452.5 L175.2,455.8 L169.8,461.7 L166.3,459.9 L163.4,462.2 L161.7,461.3 L157.1,461.7 L157.7,457.5 L159.4,454.2 L161.6,452.2 L161.0,450.6 L157.0,447.4 L152.4,446.3 L152.2,437.5 L151.6,436.0 L146.2,433.9 L136.1,423.3 L136.9,417.8 L135.6,413.9 L133.8,412.8 L133.0,408.6 L137.5,404.7 L143.3,402.5 L146.8,405.4 L147.9,403.6 L152.4,401.6 L155.0,399.0 L157.0,398.4 L151.8,395.8 L152.0,391.0 L150.9,387.9 L153.9,387.1 L154.0,375.7 L158.4,359.1 L154.9,357.1 L151.1,352.2 L145.9,350.3 L145.9,347.2 L151.9,340.4 L150.5,337.2 L151.0,334.9 L149.7,331.7 L154.1,327.8 L154.8,325.4 L158.1,326.7 L158.9,329.0 L162.6,330.8 L163.9,329.1 L166.6,328.9 L168.8,323.2 L168.8,316.9 L163.9,314.0 L164.0,308.5 L162.8,302.2 L164.6,297.6 L165.0,293.2 L166.7,288.1 L166.8,284.8 L169.3,279.7 L176.9,276.2 L182.2,269.5 L189.4,272.6 L193.1,275.8 L195.0,281.8 L197.4,286.4 L202.2,298.1 L203.0,301.3 L207.7,305.7 L211.7,308.1 L215.9,312.3 L216.6,315.3 L222.8,321.4 L225.3,321.3 L229.0,322.9 L233.3,325.9 L232.8,326.7 L235.8,331.7 L240.0,333.6 L243.3,337.1 L245.3,342.9 L245.6,345.9 L243.9,346.9 L244.3,351.4 L246.8,353.2 Z"
              onClick={() => onClick && onClick({key: "Sofala", ...provinces?.sf})}
            />
          </g>
          {!hideNames && (
            <>
              <text x="100" y="210" className={`st1 st2 ${provinces?.tt?.highlighted && "highlighted"}`}>
                {useShortName ? "TT" : "Tete"}
              </text>
              <text x="260" y="120" className={`st1 st2 ${provinces?.ns?.highlighted && "highlighted"}`}>
                {useShortName ? "NS" : "Niassa"}
              </text>
              <text x="360" y="100" className={`st1 st2 ${provinces?.cd?.highlighted && "highlighted"}`}>
                {useShortName ? "CD" : "Cabo Delgado"}
              </text>
              <text x="360" y="200" className={`st1 st2 ${provinces?.np?.highlighted && "highlighted"}`}>
                {useShortName ? "NP" : "Nampula"}
              </text>
              <text x="270" y="270" className={`st1 st2 ${provinces?.zb?.highlighted && "highlighted"}`}>
                {useShortName ? "ZB" : "Zambezia"}
              </text>
              <text x="164" y="350" className={`st1 st2 ${provinces?.sf?.highlighted && "highlighted"}`}>
                {useShortName ? "SF" : "Sofala"}
              </text>
              <text x="114" y="390" className={`st1 st2 ${provinces?.mn?.highlighted && "highlighted"}`}>
                {useShortName ? "MN" : "Manica"}
              </text>
              <text x="90" y="555" className={`st1 st2 ${provinces?.gz?.highlighted && "highlighted"}`}>
                {useShortName ? "GZ" : "Gaza"}
              </text>
              <text x="160" y="510" className={`st1 st2 ${provinces?.ib?.highlighted && "highlighted"}`}>
                {useShortName ? "IB" : "Inhambane"}
              </text>
              <text x="80" y="645" className={`st1 st2 ${provinces?.mp?.highlighted && "highlighted"}`}>
                {useShortName ? "MP" : "Maputo Provincia"}
              </text>
            </>
          )}
          <foreignObject className="node" x="110" y="215" width="200" height="100">
            {/* <MapIndicator values={provinces?.tt?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="270" y="125" width="200" height="100">
            {/* <MapIndicator values={provinces?.ns?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="370" y="105" width="200" height="100">
            {/* <MapIndicator values={provinces?.cd?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="370" y="205" width="200" height="100">
            {/* <MapIndicator values={provinces?.np?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="280" y="275" width="200" height="100">
            {/* <MapIndicator values={provinces?.zb?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="174" y="355" width="200" height="100">
            {/* <MapIndicator values={provinces?.sf?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="114" y="395" width="200" height="100">
            {/* <MapIndicator values={provinces?.mn?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="100" y="560" width="200" height="100">
            {/* <MapIndicator values={provinces?.gz?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="170" y="515" width="200" height="100">
            {/* <MapIndicator values={provinces?.ib?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
          <foreignObject className="node" x="90" y="650" width="200" height="100">
            {/* <MapIndicator values={provinces?.mp?.values} showIndicators={showIndicators}/>               */}
          </foreignObject>
        </MapSvg>
      }
      
      {/* Popover */}
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
            getPopoverContent(popoverContent.name, popoverContent.ratio, highlightedColor || theme.palette.primary.main)
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
                  Positividade: {(popoverContent.ratio * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

type MapIndicatorProps = {
  showIndicators: InteractiveSvgMapShowIndicatorsProps | undefined;
  values: ValuesProps | undefined;
}

function MapIndicator({showIndicators, values}: MapIndicatorProps){
  return (
    <Box sx={{
      display: typeof values === "undefined" ? "none" : "flex",
      flexDirection: "row",
    }}>
      <Box sx={{
        backgroundColor: "gray",
        padding: 0.5,
        ...(typeof showIndicators !== "undefined" && !showIndicators[1]) && {borderRadius: "8px"},
        borderTopLeftRadius: "8px",
        borderBottomLeftRadius: "8px",
        display: typeof showIndicators !== "undefined" && showIndicators[0] ? "block" : "none"
      }}>
        <Typography sx={{
          fontSize: 18,
          fontWeight: "bold",
          color: "white"
        }}>
          {typeof values !== "undefined" && values[0]}
        </Typography>
      </Box>
      <Box sx={{
        backgroundColor: "primary.dark",
        padding: 0.5,
        ...(typeof showIndicators !== "undefined" && !showIndicators[0]) && {borderRadius: "8px"},
        borderTopRightRadius: "8px",
        borderBottomRightRadius: "8px",
        display: typeof showIndicators !== "undefined" && showIndicators[1] ? "block" : "none"
      }}>
        <Typography sx={{
          fontSize: 18,
          fontWeight: "bold",
          color: "white"
        }}>
          {typeof values !== "undefined" && values[1]}
        </Typography>
      </Box>
    </Box>
  )
}




type ContainerProps = {
  width?: number | string;
  height?: number | string;
}

type SVGPathProps = {
  highlightedColor?: string;
  theme: any;
  pathDefaultBackgroundColor?: string
}

const Container = styled.div<ContainerProps>`
  width: ${(props: ContainerProps) => props.width};
  height: ${(props: ContainerProps) => props.height};
`

const MapSvg = styled.svg.attrs<SVGPathProps>({
  xmlns: "http://www.w3.org/2000/svg",
  width: "100%",
  height: "100%",
  viewBox: "0 0 450 702"
})`
  pointer-events: none;
  fill: ${(props: SVGPathProps) => props.theme.palette?.mode === "dark" ? "#32323C" : "#efefef"};
  title {
    font-weight: bold;
  }
  path {
    stroke: ${(props: SVGPathProps) => props.theme.palette?.mode === "dark" ? "#231f29" : "#fff"};
    stroke-width: 3;
    fill: ${(props: SVGPathProps) => props.theme.palette?.mode === "dark" ? "#32323C" : props.pathDefaultBackgroundColor};
    pointer-events: all;
    &:hover {
      cursor: pointer;
      fill: ${(props: SVGPathProps) => props.theme.palette?.mode === "dark" ? "#231f29" : grey[300]};
      /*transition-delay: 0.3s;*/
    }
  }
  path.highlighted {
    fill: ${(props: SVGPathProps) => props.highlightedColor};
  }
  path:focus{
    outline: none;
  }
  text {
    font-size: 24px;
    font-family: "Open Sans", sans-serif;
    font-weight: bold;
    fill: ${(props: SVGPathProps) => props.theme.palette?.mode === "dark" ? "#fff" : "#333333"};
  }
  text.value {
    font-size: 18px;
    font-family: "Open Sans", sans-serif;
    font-weight: normal;
    fill: ${(props: SVGPathProps) => props.highlightedColor};
  }
  text.highlighted {
    fill: white;
  }
  text:hover {
    cursor: pointer;
  }

  @media (min-width: 959px) and (max-width: 1120px) {
    height: 396px;
    width: 264px;
  }
`;
