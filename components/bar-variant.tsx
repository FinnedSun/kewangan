import { format } from "date-fns"
import {
  Tooltip,
  XAxis,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts"

import { CostomTooltip } from "@/components/costom-tooltip";



type Props = {
  data?: {
    date: string
    income: number
    expenses: number
  }[];
};

export const BarVariant = ({ data }: Props) => {
  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray={"3 3"} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={"date"}
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip content={<CostomTooltip />} />
        <Bar
          dataKey={"income"}
          fill="#17CF97"
          className="drop-shadow-sm"
        />
        <Bar
          dataKey={"expenses"}
          fill="#f43f5e"
          className="drop-shadow-sm"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}