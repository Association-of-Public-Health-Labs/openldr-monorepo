type IconlyIconProps = {
  size?: number;
  color?: string;
  style?: "outline" | "two-tone";
}

export const IconlyOutlinePatients = ({ size = 18, color = "currentColor" }: IconlyIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.37184 19.5447C4.14406 19.5447 3.40213 18.6623 3.34961 17.4331C3.34961 14.9312 5.79424 14.0682 9.47759 14.0391C13.1675 14.0779 15.6187 14.9409 15.6056 17.4331C15.5465 18.6623 14.8089 19.5447 13.5833 19.5447H5.37184Z" stroke={color} strokeWidth="1.5" stroke-miterlimit="10"></path>
      <path opacity="0.4" d="M18.1429 18.8155H19.7088C20.7028 18.8155 21.301 18.0998 21.3489 17.1029C21.3582 15.3462 19.8577 14.5876 17.5 14.3984" stroke={color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round"></path>
      <path d="M9.45838 10.9011C11.2379 10.9011 12.6804 9.45857 12.6804 7.67908C12.6804 5.89959 11.2379 4.45703 9.45838 4.45703C7.67889 4.45703 6.23633 5.89959 6.23633 7.67908C6.23633 9.45857 7.67889 10.9011 9.45838 10.9011Z" stroke={color} strokeWidth="1.5" stroke-miterlimit="10"></path>
      <path opacity="0.4" d="M17.4854 10.7598C18.6444 10.7598 19.584 9.82018 19.584 8.66113C19.584 7.50209 18.6444 6.5625 17.4854 6.5625C16.3263 6.5625 15.3867 7.50209 15.3867 8.66113C15.3867 9.82018 16.3263 10.7598 17.4854 10.7598Z" stroke={color} strokeWidth="1.5" stroke-miterlimit="10"></path>
    </svg>
  ) 
}

export const IconlyPatients = ({ size = 18, color = "currentColor", style = "outline" }: IconlyIconProps) => {
  if(style === "outline") {
    return (
      <IconlyOutlinePatients 
        size={size} 
        color={color}
      />
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.85 13.5C5.45 13.5 3.25 14.8 3.25 17.4C3.25 18.9 4.35 20 5.75 20H13.95C15.35 20 16.35 19 16.45 17.4C16.45 14.8 14.25 13.5 9.85 13.5Z" fill={color}></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M9.84997 11.4C11.95 11.4 13.55 9.8 13.55 7.7C13.55 5.6 11.95 4 9.84997 4C7.74997 4 6.14997 5.6 6.14997 7.7C6.04997 8.6 6.44997 9.5 7.14997 10.2C7.84997 11 8.84997 11.4 9.84997 11.4Z" fill={color}></path>
      <g opacity="0.4">
        <path fillRule="evenodd" clipRule="evenodd" d="M17.9498 13.6992C17.6498 13.6992 17.3498 13.7992 17.2498 14.0992C17.1498 14.2992 17.1498 14.6992 17.2498 14.8992C18.2498 16.3992 18.1498 17.7992 17.7498 18.5992C17.6498 18.7992 17.6498 19.0992 17.8498 19.2992C17.9498 19.4992 18.2498 19.5992 18.4498 19.5992H20.0498C21.4498 19.5992 22.4498 18.5992 22.4498 17.0992C22.4498 13.9992 19.0498 13.6992 17.9498 13.6992Z" fill={color}></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M17.8497 11.4992C19.4497 11.4992 20.6497 10.2992 20.6497 8.59922C20.6497 6.89922 19.4497 5.69922 17.8497 5.69922C16.2497 5.69922 14.9497 6.89922 14.9497 8.59922C14.9497 10.2992 16.2497 11.4992 17.8497 11.4992Z" fill={color}></path>
      </g>
    </svg>
  ) 
}