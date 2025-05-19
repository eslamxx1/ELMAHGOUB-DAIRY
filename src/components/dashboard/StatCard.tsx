
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  iconColor = "text-dairy-600",
  trend,
  className
}: StatCardProps) => {
  
  const isTrendPositive = trend && trend > 0;
  const isTrendNegative = trend && trend < 0;
  
  return (
    <Card className={cn(
      "overflow-hidden border shadow-md transition-all duration-200 hover:shadow-lg",
      "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(
          "rounded-full p-2",
          "bg-black/5 dark:bg-white/10",
          "transition-transform duration-300 hover:scale-110"
        )}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
            {trend !== undefined && (
              <div className={`flex items-center text-xs font-medium ${
                isTrendPositive ? 'text-green-600 dark:text-green-400' : 
                isTrendNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
              }`}>
                {isTrendPositive && '↑'}
                {isTrendNegative && '↓'}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          
          {/* مؤشر التقدم */}
          <div className="mt-2 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                iconColor === "text-green-600" ? "bg-green-600 dark:bg-green-500" :
                iconColor === "text-blue-600" ? "bg-blue-600 dark:bg-blue-500" :
                iconColor === "text-amber-600" ? "bg-amber-600 dark:bg-amber-500" :
                iconColor === "text-purple-600" ? "bg-purple-600 dark:bg-purple-500" :
                iconColor === "text-red-600" ? "bg-red-600 dark:bg-red-500" :
                "bg-dairy-600 dark:bg-dairy-500"
              }`}
              style={{ width: `${Math.min(Math.max(trend || 75, 10), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
