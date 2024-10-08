import type { SVGProps } from "react"

export function Pulse(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>pulse</title>
      <path
        fill="currentColor"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
        transform="matrix(0 0 0 0 12 12)"
      >
        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          repeatCount="indefinite"
          type="translate"
          values="12 12;0 0"
        ></animateTransform>
        <animateTransform
          additive="sum"
          attributeName="transform"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          repeatCount="indefinite"
          type="scale"
          values="0;1"
        ></animateTransform>
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="1.2s"
          keySplines=".52,.6,.25,.99"
          repeatCount="indefinite"
          values="1;0"
        ></animate>
      </path>
    </svg>
  )
}
