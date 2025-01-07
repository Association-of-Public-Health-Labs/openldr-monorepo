import React, {useEffect, MouseEvent, ReactNode} from "react";
import {useTheme} from "@mui/material/styles";
import {IoOptionsSharp} from "react-icons/io5";
import { Theme } from "@mui/material";
import styled from "styled-components";

export type MobileOptionsProps = {
  icon?: ReactNode;
  label?: string;
  active?: boolean;
}

export type Props = {
  options: MobileOptionsProps[],
  testEnv?: boolean
}

export function Mobile ({options, testEnv}: Props) {
  const theme = useTheme();

  useEffect(() => {
    const indicator = document.querySelector("[data-indicator]");
  
    document.addEventListener("click", (e) => {
      let anchor 
      // @ts-ignore
      if (e.target.matches("a")) {
        anchor = e.target
      } else {
        // @ts-ignore
        anchor = e.target.closest("a")
      }
      if (anchor != null) {
        // @ts-ignore
        const allAnchors = [...document.querySelectorAll("a")]
        const index = allAnchors.indexOf(anchor)
        // @ts-ignore
        indicator.style.setProperty("--position", testEnv ? index : index - 3)
        document.querySelectorAll("a").forEach(elem => {
          elem.classList.remove("active")
        })
        anchor.classList.add("active")
      }
    })

  },[])

  const index = options?.findIndex(option => {
    return option.active;
  });


  return (
    <MobileNav 
      theme={theme}
    >
      <ul className="list">
        {/* @ts-ignore */}
        <div style={{"--position": index}} data-indicator className="indicator">
          <div className="corners"></div>
        </div>
        {
          Array.isArray(options) && options?.map((option, index) => (
            <li key={index}>
              <a href="#" className={`${option?.active && "active"}`}>
                <div className="icon">
                  {option?.icon}
                </div>
                <div className="text">{option?.label}</div>
              </a>
            </li>
          ))
        }
        <li className="item-settings">
          {/* <a href="#"> */}
            <div className="icon">
              <IoOptionsSharp />
            </div>
            {/* <div className="text">{option?.label}</div> */}
          {/* </a> */}
        </li>
      </ul>
    </MobileNav>
  )
}



type MobileNavProps = {
  theme: Theme;
}


const MobileNav = styled.nav`
  /* .navbar-container { */
    background-color: ${(props: MobileNavProps) => props?.theme.palette.background.default};
    backdrop-filter: blur(6px);
    // backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.92"),
    // border: 1px dashed rgba(145, 158, 171, 0.24);
    border-radius: var(--border-radius);
    width: max-content;
    margin: 0 auto;
    margin-top: 10rem;
    padding: 0 calc(var(--nav-item-padding) * 1.5);
    
  /* }*/

  .list {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .list a {
    color: ${(props: MobileNavProps) => props?.theme.palette.text.primary};
    font-family: ${(props: MobileNavProps) => props?.theme.typography.fontFamily};
    font-weight: bold;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--nav-item-padding);
  }

  .list .item-settings {
    color: ${(props: MobileNavProps) => props?.theme.palette.text.primary};
    font-family: ${(props: MobileNavProps) => props?.theme.typography.fontFamily};
    font-weight: bold;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--nav-item-padding);
    cursor: pointer;
  }

  .list .text {
    font-size: .8em;
    opacity: 0;
    pointer-events: none;
    transition: 250ms ease-in-out;
    position: absolute;
    bottom: calc(.5 * var(--nav-item-padding));
    transform: translateY(50%);
    font-weight: bold;
  }

  .list .icon {
    position: relative;
    transition: 250ms ease-in-out;
  }

  .list .icon svg {
    fill: currentColor;
    width: var(--icon-size);
    height: var(--icon-size);
    display: block;
  }

  .list .active .text {
    pointer-events: all;
    color: ${(props: MobileNavProps) => props?.theme.palette.primary.main};
    font-weight: bold;
    opacity: 1;
    transform: translateY(0);
    font-family: ${(props: MobileNavProps) => props?.theme.typography.fontFamily};
  }

  .list .active .icon {
    transform: translateY(calc(-50% - var(--nav-item-padding)));
    color: #fff;
    font-family: ${(props: MobileNavProps) => props?.theme.typography.fontFamily};
  }

  .list {
    position: relative;
  }

  .indicator {
    position: absolute;
    left: calc(var(--position) * (var(--icon-size) + var(--nav-item-padding) * 2));
    transition: 250ms ease-in-out;
  }

  .indicator::after,
  .indicator::before {
    content: "";
    position: absolute;
    border-radius: 100%;
  }

  .indicator::after {
    background-color: ${(props: MobileNavProps) => props?.theme.palette.primary.main};
    width: calc(var(--icon-size) * 2);
    height: calc(var(--icon-size) * 2);
    top: calc(-1 * var(--icon-size));
  }
  .indicator::before {
    background-color: ${(props: MobileNavProps) => props?.theme.palette.background.paper};
    width: calc((var(--icon-size) + var(--indicator-spacing)) * 2);
    height: calc((var(--icon-size) + var(--indicator-spacing)) * 2);
    top: calc(-1 * var(--icon-size) - var(--indicator-spacing));
    left: calc(-1 * var(--indicator-spacing));
  }

  .corners::before {
    content: "";
    box-sizing: content-box;
    position: absolute;
    width: var(--border-radius);
    height: var(--border-radius);
    background-color: ${(props: MobileNavProps) => props?.theme.palette.background.default};
    z-index: 1;
    top: calc(-1 * var(--indicator-spacing));
    left: calc(.2 * var(--indicator-spacing));
    transform: translateX(-100%);
    border-top-right-radius: 100%;
    border-width: calc(var(--indicator-spacing));
    border-color: ${(props: MobileNavProps) => props?.theme.palette.background.paper};
    border-style: solid; 
    border-bottom: none;
    border-left: none;
  }

  .corners::after {
    content: "";
    box-sizing: content-box;
    position: absolute;
    width: var(--border-radius);
    height: var(--border-radius);
    background-color: ${(props: MobileNavProps) => props?.theme.palette.background.default};
    z-index: 1;
    top: calc(-1 * var(--indicator-spacing));
    left: calc(var(--icon-size) * 2 + -.2 * var(--indicator-spacing));
    border-top-left-radius: 100%;
    border-width: calc(var(--indicator-spacing));
    border-color: ${(props: MobileNavProps) => props?.theme.palette.background.paper};
    border-style: solid;
    border-bottom: none;
    border-right: none;
  }
`;
