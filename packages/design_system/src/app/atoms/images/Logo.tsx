// The file, not the "@repo/design_system_mui" barrel: the barrel pulls in apexcharts, which touches
// `window` at import time and crashes server rendering of any page that shows the logo.
export { Logo, type LogoProps } from "../../../../../design_system_mui/src/atoms/images/Logo";
