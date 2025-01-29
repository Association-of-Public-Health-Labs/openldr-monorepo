
type IconlyIconProps = {
  size?:number;
  color?:string;
  style?: "outline" | "two-tone";
}

export const IconlyLocation = ({ size = 24, color = "#000000", style = "outline" }: IconlyIconProps) => {

  if(style === "two-tone") {
    return <IconlyTwoToneLocation size={size} color={color} />
  }

  return <IconlyOutlineLocation size={size} color={color} />
}

export const IconlyOutlineLocation = ({ size = 24, color = "#000000" }: IconlyIconProps) => {
  return (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6621 7.42578H13.3381" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M10.6621 15.6016H13.3381" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M12.0039 21L12.0019 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M11.9961 4.99965L11.9951 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M12 13L11.998 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M17.9212 5.33329C17.7315 5.12118 17.4604 4.99996 17.1758 5L6.49583 5.00137C5.94359 5.00144 5.49596 5.44914 5.49596 6.00137V9.00562C5.49596 9.55796 5.94375 10.0057 6.49609 10.0056L17.1759 10.0043C17.4604 10.0042 17.7314 9.883 17.9211 9.67096L19.2649 8.16878C19.6044 7.78916 19.6044 7.21498 19.2649 6.83536L17.9212 5.33329Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M6.07878 13.3294C6.26852 13.1173 6.53964 12.9961 6.82423 12.9961L17.5042 12.9975C18.0564 12.9975 18.504 13.4452 18.504 13.9975V17.0017C18.504 17.5541 18.0562 18.0018 17.5039 18.0017L6.82408 18.0003C6.53958 18.0003 6.26856 17.8791 6.07889 17.6671L4.73515 16.1649C4.39558 15.7853 4.39558 15.2111 4.73515 14.8315L6.07878 13.3294Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
  ) 
}

export const IconlyTwoToneLocation = ({ size = 24, color = "#000000" }: IconlyIconProps) => {
  return (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M17.18 10.5C17.6 10.5 18.01 10.32 18.29 10L19.64 8.5C20.15 7.93 20.15 7.07 19.64 6.5L18.29 5C18.01 4.68 17.6 4.5 17.18 4.5H12.746H11.246H6.5C5.67 4.5 5 5.17 5 6V9.01C5 9.83 5.67 10.51 6.5 10.51H11.248L12.748 10.5H17.18ZM10.66 8.17969C10.25 8.17969 9.91 7.83969 9.91 7.42969C9.91 7.00969 10.25 6.67969 10.66 6.67969H13.34C13.75 6.67969 14.09 7.00969 14.09 7.42969C14.09 7.83969 13.75 8.17969 13.34 8.17969H10.66Z" fill={color}></path>
<g opacity="0.4">
<path fillRule="evenodd" clipRule="evenodd" d="M11.2495 12.496L11.2485 10.505H12.7485L12.7495 12.497L11.2495 12.496ZM11.2545 21.001L11.2525 18.501H12.7525L12.7545 20.999C12.7545 21.414 12.4185 21.75 12.0045 21.75C11.5905 21.75 11.2545 21.414 11.2545 21.001ZM11.2455 3L11.2465 4.501L12.7465 4.5L12.7455 3C12.7455 2.586 12.4095 2.25 11.9955 2.25H11.9945C11.5805 2.25 11.2455 2.586 11.2455 3Z" fill={color}></path>
<path d="M6.81998 12.5H17.5C18.33 12.5 19 13.17 19 14V17C19 17.83 18.33 18.5 17.5 18.5H6.81998C6.39998 18.5 5.98998 18.32 5.70998 18L4.35998 16.5C3.84998 15.93 3.84998 15.07 4.35998 14.5L5.70998 13C5.98998 12.68 6.39998 12.5 6.81998 12.5Z" fill={color}></path>
</g>
<path d="M9.91003 15.5996C9.91003 16.0196 10.25 16.3496 10.66 16.3496H13.34C13.75 16.3496 14.09 16.0196 14.09 15.5996C14.09 15.1896 13.75 14.8496 13.34 14.8496H10.66C10.25 14.8496 9.91003 15.1896 9.91003 15.5996Z" fill={color}></path>
</svg>
  ) 
}