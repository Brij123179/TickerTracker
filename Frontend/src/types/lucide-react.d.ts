declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface LucideProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = FC<LucideProps>;

  // Common icons used in the app
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Bot: LucideIcon;
  export const Calendar: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const Download: LucideIcon;
  export const FileText: LucideIcon;
  export const Filter: LucideIcon;
  export const Heart: LucideIcon;
  export const Loader: LucideIcon;
  export const Mail: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const Moon: LucideIcon;
  export const Pause: LucideIcon;
  export const Play: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const Star: LucideIcon;
  export const StarOff: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const User: LucideIcon;
  export const UserPlus: LucideIcon;
  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;

  // Default export
  const lucide: {
    [key: string]: LucideIcon;
  };
  export default lucide;
}
