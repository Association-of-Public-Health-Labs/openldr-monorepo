type IconlyIconProps = {
  size?: number;
  color?: string;
  style?: "outline" | "two-tone";
}

export const IconlyGrid = ({ size = 18, color = "currentColor", style = "outline" }: IconlyIconProps) => {
  if(style === "two-tone") {
    return (
      <IconlyTwoToneGrid 
        size={size} 
        color={color}
      />
    )
  }

  return (
    <IconlyOutlineGrid 
      size={size} 
      color={color}
    />
  )
}

export const IconlyTwoToneGrid = ({ size = 18, color = "currentColor" }: IconlyIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.4">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.302 13.5H5.698C4.21 13.5 3 14.71 3 16.198V18.802C3 20.29 4.21 21.5 5.698 21.5H8.302C9.79 21.5 11 20.29 11 18.802V16.198C11 14.71 9.79 13.5 8.302 13.5Z" fill={color}></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M19.302 2.5H16.698C15.21 2.5 14 3.71 14 5.198V7.802C14 9.29 15.21 10.5 16.698 10.5H19.302C20.79 10.5 22 9.29 22 7.802V5.198C22 3.71 20.79 2.5 19.302 2.5Z" fill={color}></path>
      </g>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.302 2.5H5.698C4.21 2.5 3 3.71 3 5.198V7.802C3 9.29 4.21 10.5 5.698 10.5H8.302C9.79 10.5 11 9.29 11 7.802V5.198C11 3.71 9.79 2.5 8.302 2.5Z" fill={color}></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M19.302 13.5H16.698C15.21 13.5 14 14.71 14 16.198V18.802C14 20.29 15.21 21.5 16.698 21.5H19.302C20.79 21.5 22 20.29 22 18.802V16.198C22 14.71 20.79 13.5 19.302 13.5Z" fill={color}></path>
    </svg>
  ) 
}

export const IconlyOutlineGrid = ({ size = 18, color = "currentColor" }: IconlyIconProps) => {
  return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.802 10H5.198C3.984 10 3 9.016 3 7.802V5.198C3 3.984 3.984 3 5.198 3H7.802C9.016 3 10 3.984 10 5.198V7.802C10 9.016 9.016 10 7.802 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.802 21H16.198C14.984 21 14 20.016 14 18.802V16.198C14 14.984 14.984 14 16.198 14H18.802C20.016 14 21 14.984 21 16.198V18.802C21 20.016 20.016 21 18.802 21Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.802 21H5.198C3.984 21 3 20.016 3 18.802V16.198C3 14.984 3.984 14 5.198 14H7.802C9.016 14 10 14.984 10 16.198V18.802C10 20.016 9.016 21 7.802 21Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.802 10H16.198C14.984 10 14 9.016 14 7.802V5.198C14 3.984 14.984 3 16.198 3H18.802C20.016 3 21 3.984 21 5.198V7.802C21 9.016 20.016 10 18.802 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
		</svg>
  ) 
}