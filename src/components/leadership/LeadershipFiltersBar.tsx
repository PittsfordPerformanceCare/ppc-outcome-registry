import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LeadershipFilters } from '@/hooks/useLeadershipAnalytics';
import { Calendar, Layers, MapPin, User, Shield } from 'lucide-react';

interface LeadershipFiltersBarProps {
  filters: LeadershipFilters;
  onFilterChange: (key: keyof LeadershipFilters, value: any) => void;
  domains: string[];
  bodyRegions: string[];
}

export function LeadershipFiltersBar({
  filters,
  onFilterChange,
  domains,
  bodyRegions,
}: LeadershipFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
      {/* Time Window */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filters.timeWindow}
          onValueChange={(value) => onFilterChange('timeWindow', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time window" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12mo">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domain */}
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filters.domain || 'all'}
          onValueChange={(value) => onFilterChange('domain', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((domain) => (
              <SelectItem key={domain} value={domain}>
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body Region */}
      {bodyRegions.length > 0 && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.bodyRegion || 'all'}
            onValueChange={(value) => onFilterChange('bodyRegion', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Body Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {bodyRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Include Overrides */}
      <div className="flex items-center gap-2 ml-auto">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <Switch
          id="include-overrides"
          checked={filters.includeOverrides}
          onCheckedChange={(checked) => onFilterChange('includeOverrides', checked)}
        />
        <Label htmlFor="include-overrides" className="text-sm cursor-pointer">
          Include Overrides
        </Label>
      </div>
    </div>
  );
}
