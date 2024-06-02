import {
  ResponsiveContainer,
  Legend,
  RadialBar,
  RadialBarChart
} from "recharts"

import { formatCurrency } from "@/lib/utils"

const COLORS = ["#17CF97", "#97BE5A", "#FF647F", "#FF9354"]

type Props = {
  data?: {
    name: string
    value: number
  }[];
};

export const RadialVariant = ({ data }: Props) => {
  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <RadialBarChart
        cy={"50%"}
        cx={"50%"}
        barSize={10}
        innerRadius={"90%"}
        outerRadius={"40%"}
        data={data?.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length]
        }))}
      >
        <RadialBar
          label={{
            position: "insideStart",
            fill: "#fff",
            fontSize: "12px"
          }}
          background
          dataKey={"value"}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          content={({ payload }: any) => {
            return (
              <ul className="flex flex-col scroll-py-2">
                {payload.map((entry: any, index: number) => (
                  <li
                    key={`items-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="space-x-1">
                      <span className="text-sm text-muted-foreground">
                        {entry.value}
                      </span>
                      <span className="text-sm">
                        {formatCurrency(entry.payload.value)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }}
        />

      </RadialBarChart>
    </ResponsiveContainer>
  )
}