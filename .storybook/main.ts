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
    "../packages/**/src/**/*.stories.@(js|jsx|ts|tsx)",
    "../apps/**/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
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
        border-radius: 12px !important;
        box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
      }
      .apexcharts-xaxistooltip-bottom:before{
        border: none !important;
        box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
      }
      .apexcharts-xaxistooltip-bottom:after{
        border: none !important;
        box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
      }
      .apexcharts-tooltip {
        padding: 7px !important;
        border-radius: 12px !important;
        font-family: "Open Sans", "Nunito Sans", sans-serif !important;
        border: none !important;
        -webkit-backdrop-filter: blur(6px) !important;
        backdrop-filter: blur(6px) !important;
        background-color: rgba(255, 255, 255, 0.8) !important;
        box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
      }  
      .tippy-box{
        border: none !important;
        -webkit-backdrop-filter: blur(6px) !important;
        backdrop-filter: blur(6px) !important;
        background-color: rgba(35, 31, 41, 0.8) !important;
        color: #FFFFFF !important;
        max-width: 150px !important;
        font-family: "Open Sans", "Nunito Sans", sans-serif !important;
        // box-shadow: rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px !important;
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
      
    </style>
  `),
};
export default config;