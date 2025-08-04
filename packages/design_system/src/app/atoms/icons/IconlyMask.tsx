type IconlyIconProps = {
  size?:number;
  color?:string;
}

export const IconlyMask = ({ size = 24, color = "currentColor" }: IconlyIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.6836 12.9453C21.6836 7.9744 17.6545 3.94531 12.6846 3.94531C7.71463 3.94531 3.68555 7.9744 3.68555 12.9453C3.68555 17.9153 7.71463 21.9444 12.6846 21.9444C17.6545 21.9444 21.6836 17.9153 21.6836 12.9453Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path opacity="0.4" d="M12.6309 20.8749L21.6301 11.9922" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path opacity="0.4" d="M17.8949 5.60938L12.709 10.7369" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path opacity="0.4" d="M12.6602 15.8258L20.3462 8.2168" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M12.6211 3.94531V21.9444" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  ) 
}