import type { StorybookConfig } from "@storybook/nextjs";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  // "previewHead": (head) => (`
  //   ${head}
  //   <style>
  //     .apexcharts-xaxistooltip{
  //       background: white !important; 
  //       margin-top: 4px;
  //       padding: 10px 12px 10px 12px !important;
  //       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
  //       font-weight: bold !important;
  //       border: none !important;
  //       color: #333 !important;
  //       border-radius: 12px !important;
  //       // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
  //     }
  //     .apexcharts-xaxistooltip-bottom:before{
  //       border: none !important;
  //       // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
  //     }
  //     .apexcharts-xaxistooltip-bottom:after{
  //       border: none !important;
  //       // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
  //     }
  //     .apexcharts-tooltip {
  //       padding: 0px !important;
  //       border-radius: 12px !important;
  //       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
  //       border: none !important;
  //       -webkit-backdrop-filter: blur(6px) !important;
  //       color: #333 !important;
  //       backdrop-filter: blur(6px) !important;
  //       // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
  //       box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important;
  //     }  
  //     .apexcharts-tooltip:before,
  //     .apexcharts-tooltip:after {
  //       display: none !important;
  //       border: none !important;
  //       box-shadow: none !important;
  //       background: none !important;
  //       content: none !important;
  //       filter: none !important;
  //       -webkit-filter: none !important;
  //     }
  //     .tippy-box{
  //       border: none !important;
  //       -webkit-backdrop-filter: blur(6px) !important;
  //       backdrop-filter: blur(6px) !important;
  //       background-color: rgba(35, 31, 41, 0.8) !important;
  //       // color: #FFFFFF !important;
  //       max-width: 150px !important;
  //       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
  //       // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
  //       border-radius: 8px !important;
  //       padding: 10px !important;
  //     }
  //     .tippy-content{
  //       padding: 0 !important;
  //       margin: 0px !important;
  //     }
      
  //     *, *::before, *::after {
  //       box-sizing: border-box;
  //     }
      
  //     :root {
  //       --icon-size: 1.5rem;
  //       --indicator-spacing: calc(var(--icon-size) / 8);
  //       --border-radius: calc(var(--icon-size) / 4);
  //       --nav-item-padding: calc(var(--icon-size) / 2);
  //       --background-color: #333;
  //     }

  //     .apexcharts-tooltip-title {
  //       background: rgba(35, 31, 41, 0.8) !important; /* Example: slate-800 */
  //       color: #fff !important;
  //       padding: 4px 8px !important; /* Optional: adjust header padding */
  //       border-radius: 0px !important; /* Optional: rounded corners */
  //       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
  //       text-align: center !important;
  //     }
      
  //   </style>
  // `),
//   "previewHead": (head) => (`
//   ${head}
//   <style>
//     .apexcharts-xaxistooltip{
//       background: white !important; 
//       margin-top: 4px;
//       padding: 10px 12px 10px 12px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       font-weight: bold !important;
//       border: none !important;
//       color: #333 !important;
//       border-radius: 12px !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//       box-shadow: none !important;
//     }
//     .apexcharts-xaxistooltip-bottom:before{
//       border: none !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//     }
//     .apexcharts-xaxistooltip-bottom:after{
//       border: none !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//     }
//     .apexcharts-tooltip {
//       padding: 0px !important;
//       border-radius: 12px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       border: none !important;
//       -webkit-backdrop-filter: blur(6px) !important;
//       color: #333 !important;
//       backdrop-filter: blur(6px) !important;
//       box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//     }  
    
//     /* Remove ALL tooltip arrows and borders */
//     .apexcharts-tooltip:before,
//     .apexcharts-tooltip:after,
//     .apexcharts-tooltip-top:before,
//     .apexcharts-tooltip-top:after,
//     .apexcharts-tooltip-bottom:before,
//     .apexcharts-tooltip-bottom:after,
//     .apexcharts-tooltip-left:before,
//     .apexcharts-tooltip-left:after,
//     .apexcharts-tooltip-right:before,
//     .apexcharts-tooltip-right:after {
//       display: none !important;
//       border: none !important;
//       box-shadow: none !important;
//       background: none !important;
//       content: none !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//       opacity: 0 !important;
//       visibility: hidden !important;
//     }
    
//     .tippy-box{
//       border: none !important;
//       -webkit-backdrop-filter: blur(6px) !important;
//       backdrop-filter: blur(6px) !important;
//       background-color: rgba(35, 31, 41, 0.8) !important;
//       max-width: 150px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       border-radius: 8px !important;
//       padding: 10px !important;
//     }
//     .tippy-content{
//       padding: 0 !important;
//       margin: 0px !important;
//     }
    
//     *, *::before, *::after {
//       box-sizing: border-box;
//     }
    
//     :root {
//       --icon-size: 1.5rem;
//       --indicator-spacing: calc(var(--icon-size) / 8);
//       --border-radius: calc(var(--icon-size) / 4);
//       --nav-item-padding: calc(var(--icon-size) / 2);
//       --background-color: #333;
//     }

//     .apexcharts-tooltip-title {
//       background: rgba(35, 31, 41, 0.8) !important;
//       color: #fff !important;
//       padding: 4px 8px !important;
//       border-radius: 0px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       text-align: center !important;
//     }
    
//   </style>
// `),
// "previewHead": (head) => (`
//   ${head}
//   <style>
//     .apexcharts-xaxistooltip{
//       background: white !important; 
//       margin-top: 4px;
//       padding: 10px 12px 10px 12px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       font-weight: bold !important;
//       border: none !important;
//       color: #333 !important;
//       border-radius: 12px !important;
//     }
//     .apexcharts-xaxistooltip-bottom:before{
//       border: none !important;
//     }
//     .apexcharts-xaxistooltip-bottom:after{
//       border: none !important;
//     }
//     .apexcharts-tooltip {
//       padding: 0px !important;
//       border-radius: 12px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       border: none !important;
//       -webkit-backdrop-filter: blur(6px) !important;
//       color: #333 !important;
//       backdrop-filter: blur(6px) !important;
//       box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important; /* Keep your custom shadow */
//     }  
    
//     /* Remove borders but keep shadows */
//     .apexcharts-tooltip:before,
//     .apexcharts-tooltip:after,
//     .apexcharts-tooltip-top:before,
//     .apexcharts-tooltip-top:after,
//     .apexcharts-tooltip-bottom:before,
//     .apexcharts-tooltip-bottom:after,
//     .apexcharts-tooltip-left:before,
//     .apexcharts-tooltip-left:after,
//     .apexcharts-tooltip-right:before,
//     .apexcharts-tooltip-right:after {
//       display: none !important;
//       border: none !important;
//       background: none !important;
//       content: none !important;
//       filter: none !important;
//       -webkit-filter: none !important;
//       opacity: 0 !important;
//       visibility: hidden !important;
//       /* Don't override box-shadow here - let the main tooltip keep its shadow */
//     }
    
//     /* Additional override to ensure no border effects */
//     .apexcharts-tooltip * {
//       border: none !important;
//     }
    
//     .tippy-box{
//       border: none !important;
//       -webkit-backdrop-filter: blur(6px) !important;
//       backdrop-filter: blur(6px) !important;
//       background-color: rgba(35, 31, 41, 0.8) !important;
//       max-width: 150px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       border-radius: 8px !important;
//       padding: 10px !important;
//     }
//     .tippy-content{
//       padding: 0 !important;
//       margin: 0px !important;
//     }
    
//     *, *::before, *::after {
//       box-sizing: border-box;
//     }
    
//     :root {
//       --icon-size: 1.5rem;
//       --indicator-spacing: calc(var(--icon-size) / 8);
//       --border-radius: calc(var(--icon-size) / 4);
//       --nav-item-padding: calc(var(--icon-size) / 2);
//       --background-color: #333;
//     }

//     .apexcharts-tooltip-title {
//       background: rgba(35, 31, 41, 0.8) !important;
//       color: #fff !important;
//       padding: 4px 8px !important;
//       border-radius: 0px !important;
//       font-family: "Open Sans", "Nunito Sans", sans-serif !important;
//       text-align: center !important;
//     }
    
//   </style>
// `),
"previewHead": (head) => (`
  ${head}
  <style>
    .apexcharts-xaxistooltip{
      background: white !important; 
      margin-top: 4px;
      padding: 10px 12px 10px 12px !important;
      font-family: "Open Sans", "Nunito Sans", sans-serif !important;
      font-weight: bold !important;
      border: none !important;
      color: #333 !important;
      border-radius: 12px !important;
    }
    .apexcharts-xaxistooltip-bottom:before{
      border: none !important;
    }
    .apexcharts-xaxistooltip-bottom:after{
      border: none !important;
    }
    
    /* Main tooltip container */
    .apexcharts-tooltip {
      padding: 0px !important;
      border-radius: 12px !important;
      font-family: "Open Sans", "Nunito Sans", sans-serif !important;
      // border: none !important;
      outline: none !important;
      -webkit-backdrop-filter: blur(6px) !important;
      color: #333 !important;
      backdrop-filter: blur(6px) !important;
      // box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important;
      /* Remove all possible border effects */
      border-width: 0 !important;
      border-style: none !important;
      border-color: transparent !important;
      border: none !important; 
      box-shadow: none !important;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1)) !important;
    }  
    
    /* Remove ALL tooltip arrows and borders - more comprehensive */
    .apexcharts-tooltip:before,
    .apexcharts-tooltip:after,
    .apexcharts-tooltip-top:before,
    .apexcharts-tooltip-top:after,
    .apexcharts-tooltip-bottom:before,
    .apexcharts-tooltip-bottom:after,
    .apexcharts-tooltip-left:before,
    .apexcharts-tooltip-left:after,
    .apexcharts-tooltip-right:before,
    .apexcharts-tooltip-right:after {
      display: none !important;
      border: none !important;
      border-width: 0 !important;
      border-style: none !important;
      border-color: transparent !important;
      background: none !important;
      content: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Remove borders from all tooltip content */
    .apexcharts-tooltip *,
    .apexcharts-tooltip *:before,
    .apexcharts-tooltip *:after {
      border: none !important;
      border-width: 0 !important;
      border-style: none !important;
      border-color: transparent !important;
      outline: none !important;
    }
    
    /* Additional specific selectors for ApexCharts tooltip borders */
    .apexcharts-tooltip-box,
    .apexcharts-tooltip-box:before,
    .apexcharts-tooltip-box:after {
      border: none !important;
      border-width: 0 !important;
      border-style: none !important;
      border-color: transparent !important;
      outline: none !important;
    }
    
    .tippy-box{
      border: none !important;
      -webkit-backdrop-filter: blur(6px) !important;
      backdrop-filter: blur(6px) !important;
      background-color: rgba(35, 31, 41, 0.8) !important;
      max-width: 150px !important;
      font-family: "Open Sans", "Nunito Sans", sans-serif !important;
      border-radius: 8px !important;
      padding: 10px !important;
    }
    .tippy-content{
      padding: 0 !important;
      margin: 0px !important;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    :root {
      --icon-size: 1.5rem;
      --indicator-spacing: calc(var(--icon-size) / 8);
      --border-radius: calc(var(--icon-size) / 4);
      --nav-item-padding: calc(var(--icon-size) / 2);
      --background-color: #333;
    }

    .apexcharts-tooltip-title {
      background: rgba(35, 31, 41, 0.8) !important;
      color: #fff !important;
      padding: 4px 8px !important;
      border-radius: 0px !important;
      font-family: "Open Sans", "Nunito Sans", sans-serif !important;
      text-align: center !important;
    }
    
  </style>
`),
};
export default config;
