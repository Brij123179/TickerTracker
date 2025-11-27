declare module 'recharts' {
  import { FC, ReactNode, CSSProperties, SVGProps } from 'react';

  export interface BaseProps {
    className?: string;
    style?: CSSProperties;
  }

  export interface CartesianGridProps extends BaseProps {
    strokeDasharray?: string | number;
    stroke?: string;
    strokeWidth?: number | string;
    opacity?: number;
  }

  export interface XAxisProps extends BaseProps {
    dataKey?: string | number | Function;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    tick?: boolean | object | FC<any>;
    tickFormatter?: (value: any, index: number) => string;
    domain?: [number | string, number | string];
    type?: 'number' | 'category';
  }

  export interface YAxisProps extends BaseProps {
    dataKey?: string | number | Function;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    tick?: boolean | object | FC<any>;
    tickFormatter?: (value: any, index: number) => string;
    domain?: [number | string | Function, number | string | Function];
    type?: 'number' | 'category';
  }

  export interface TooltipProps extends BaseProps {
    content?: ReactNode | FC<any>;
    formatter?: (value: any, name: any, props: any) => [any, any];
    labelFormatter?: (label: any, payload: any[]) => ReactNode;
    active?: boolean;
    payload?: any[];
    label?: any;
  }

  export interface ResponsiveContainerProps extends BaseProps {
    width?: string | number;
    height?: string | number;
    aspect?: number;
    minHeight?: number;
    children: ReactNode;
  }

  export interface LineProps extends BaseProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string | number | Function;
    stroke?: string;
    strokeWidth?: number | string;
    strokeDasharray?: string | number;
    dot?: boolean | object | ReactNode | FC<any>;
    activeDot?: boolean | object | ReactNode | FC<any>;
    fill?: string;
    fillOpacity?: number | string;
    strokeOpacity?: number | string;
  }

  export interface AreaProps extends BaseProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string | number | Function;
    stroke?: string;
    strokeWidth?: number | string;
    strokeDasharray?: string | number;
    dot?: boolean | object | ReactNode | FC<any>;
    activeDot?: boolean | object | ReactNode | FC<any>;
    fill?: string;
    fillOpacity?: number | string;
    strokeOpacity?: number | string;
  }

  export interface LineChartProps extends BaseProps {
    data: any[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
  }

  export interface AreaChartProps extends BaseProps {
    data: any[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
  }

  // Components
  export const LineChart: FC<LineChartProps>;
  export const AreaChart: FC<AreaChartProps>;
  export const Line: FC<LineProps>;
  export const Area: FC<AreaProps>;
  export const XAxis: FC<XAxisProps>;
  export const YAxis: FC<YAxisProps>;
  export const CartesianGrid: FC<CartesianGridProps>;
  export const Tooltip: FC<TooltipProps>;
  export const ResponsiveContainer: FC<ResponsiveContainerProps>;
}
