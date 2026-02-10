import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';
import { NutritionEstimate } from '@/types';

interface NutritionChartProps {
    nutrition: NutritionEstimate;
}

export function NutritionChart({ nutrition }: NutritionChartProps) {
    // Normalize data for radar chart (rough estimation for visual representation)
    const data = [
        { subject: 'Protein', A: (nutrition.protein || 0) * 10, fullMark: 100 },
        { subject: 'Sugar', A: 100 - (nutrition.sugar || 0) * 5, fullMark: 100 }, // Inverse because less is better
        { subject: 'Fat', A: 100 - (nutrition.fat || 0) * 3, fullMark: 100 },   // Inverse because less is better
        { subject: 'Fiber', A: (nutrition.fiber || 0) * 20, fullMark: 100 },
        { subject: 'Energy', A: Math.min((nutrition.energy || 0) / 10, 100), fullMark: 100 },
    ];

    return (
        <div className="w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="hsla(var(--border), 0.5)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                    />
                    <Radar
                        name="Nutrition"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
