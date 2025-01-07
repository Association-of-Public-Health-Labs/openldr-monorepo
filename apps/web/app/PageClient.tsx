"use client"
import { BarGroup, } from "@repo/ui/atoms";


export default function Client () {
  const {BarGroup: ApexBarGroup} = BarGroup
  const labels = ["January", "February", "March", "April", "May"];
  const series = [
    {
      name: "Series 1",
      data: [30, 40, 45, 50, 49],
    },
    {
      name: "Series 2",
      data: [20, 30, 35, 40, 39],
    },
    {
      name: "Series 3",
      data: [25, 35, 40, 45, 50],
    },
  ];

  const handleBarClick = (label: string) => {
    alert(`You clicked on ${label}`);
  };

  return (
    <ApexBarGroup
      labels={labels}
      series={series}
      yLabel="Values"
      height={400}
      width="100%"
      id="demo-chart"
      onClick={handleBarClick}
    />
  )
}