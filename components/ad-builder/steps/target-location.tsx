"use client"

/**
 * Step 2: Target Location
 * Purpose: Define where ads should be shown with interactive map
 */

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Loader2, X, Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { AdBuilderStepProps } from "@/lib/types/ad-builder"
import { useLocationTargeting, type LocationTargeting } from "@/lib/context/location-targeting-context"
import { LocationTargetingMap } from "@/components/location-targeting-map"

type TargetLocationProps = AdBuilderStepProps

interface LocationSuggestion {
  key: string
  name: string
  type: 'country' | 'region' | 'city'
  country_code?: string
}

export function TargetLocation({ draft, onUpdate, onNext, onBack }: TargetLocationProps) {
  const { locations, addLocation, removeLocation, clearLocations } = useLocationTargeting()
  
  // Form state
  const [locationSearch, setLocationSearch] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [coverageType, setCoverageType] = useState<'radius' | 'full'>('full')
  const [radiusMiles, setRadiusMiles] = useState(25)
  const [targetingMode, setTargetingMode] = useState<'include' | 'exclude'>('include')
  const [highlightLocationId, setHighlightLocationId] = useState<string | undefined>()

  // Validation
  const includedLocations = locations.filter(loc => loc.mode === 'include')
  const excludedLocations = locations.filter(loc => loc.mode === 'exclude')
  const isValid = includedLocations.length > 0

  // Search locations via Meta API
  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([])
      return
    }

    try {
      setLocationLoading(true)
      
      const response = await fetch(
        `/api/v1/meta/search-locations?q=${encodeURIComponent(query)}`
      )

      if (response.ok) {
        const data = await response.json()
        setLocationSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Location search error:", error)
    } finally {
      setLocationLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocations(locationSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [locationSearch, searchLocations])

  // Mock coordinates for locations (in production, get from Meta API or geocoding)
  const getMockCoordinates = (suggestion: LocationSuggestion): [number, number] => {
    // This is a simple mock - in production, you'd get coordinates from Meta API
    const mockCoords: Record<string, [number, number]> = {
      'US': [-95.7129, 37.0902],
      'GB': [-3.4360, 55.3781],
      'CA': [-106.3468, 56.1304],
      'AU': [133.7751, -25.2744],
      'US-NY': [-74.0060, 40.7128],
      'US-CA': [-119.4179, 36.7783],
      'US-TX': [-99.9018, 31.9686],
      'US-FL': [-81.7603, 27.6648],
      'NYC': [-74.0060, 40.7128],
      'LA': [-118.2437, 34.0522],
      'CHI': [-87.6298, 41.8781],
      'SF': [-122.4194, 37.7749],
    }
    return mockCoords[suggestion.key] || [-98.5795, 39.8283] // Default to center of US
  }

  // Mock bbox for locations
  const getMockBbox = (suggestion: LocationSuggestion): [number, number, number, number] => {
    const coords = getMockCoordinates(suggestion)
    const offset = suggestion.type === 'country' ? 10 : suggestion.type === 'region' ? 3 : 0.5
    return [
      coords[0] - offset, // minLng
      coords[1] - offset, // minLat
      coords[0] + offset, // maxLng
      coords[1] + offset, // maxLat
    ]
  }

  const handleAddLocation = (suggestion: LocationSuggestion) => {
    const id = `${suggestion.key}-${Date.now()}`
    const newLocation: LocationTargeting = {
      id,
      name: suggestion.name,
      type: suggestion.type,
      mode: targetingMode,
      coverage: coverageType,
      radius: coverageType === 'radius' ? radiusMiles : undefined,
      coordinates: getMockCoordinates(suggestion),
      bbox: coverageType === 'full' ? getMockBbox(suggestion) : undefined,
      key: suggestion.key,
      country_code: suggestion.country_code,
    }

    addLocation(newLocation)
    
    // Update draft immediately
    const updatedLocations = [...locations, newLocation]
    const includedNames = updatedLocations.filter(l => l.mode === 'include').map(l => l.name)
    onUpdate({
      targeting: {
        ...draft.targeting,
        locations: includedNames,
      },
    })
    
    // Visual confirmation
    setHighlightLocationId(id)
    setTimeout(() => setHighlightLocationId(undefined), 2000)
    
    toast.success(
      `${suggestion.name} ${targetingMode === 'include' ? 'included' : 'excluded'}`,
      {
        description: coverageType === 'radius' 
          ? `${radiusMiles} mile radius` 
          : `Full ${suggestion.type}`,
      }
    )
    
    // Reset form
    setLocationSearch("")
    setLocationSuggestions([])
  }

  const handleRemoveLocation = (id: string) => {
    removeLocation(id)
    
    // Update draft immediately
    const updatedLocations = locations.filter(l => l.id !== id)
    const includedNames = updatedLocations.filter(l => l.mode === 'include').map(l => l.name)
    onUpdate({
      targeting: {
        ...draft.targeting,
        locations: includedNames,
      },
    })
    
    toast.info('Location removed')
  }

  const handleClearAll = () => {
    clearLocations()
    
    // Update draft immediately
    onUpdate({
      targeting: {
        ...draft.targeting,
        locations: [],
      },
    })
    
    toast.info('All locations cleared')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Map & Controls */}
      <div className="space-y-6">
        {/* Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Map
            </CardTitle>
            <CardDescription>
              {locations.length === 0 
                ? "Add locations to see them on the map"
                : `Showing ${locations.length} location${locations.length !== 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationTargetingMap 
              locations={locations} 
              highlightLocationId={highlightLocationId}
            />
          </CardContent>
        </Card>

        {/* Location List */}
        {locations.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Selected Locations</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Included Locations */}
              {includedLocations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Included</h4>
                    <Badge variant="secondary">{includedLocations.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {includedLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        onRemove={handleRemoveLocation}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Locations */}
              {excludedLocations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Excluded</h4>
                    <Badge variant="destructive">{excludedLocations.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {excludedLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        onRemove={handleRemoveLocation}
                        isExcluded
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Add Location Form & Navigation */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Location</CardTitle>
            <CardDescription>Search and configure location targeting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Targeting Mode */}
            <div className="space-y-2">
              <Label>Targeting Mode</Label>
              <Select value={targetingMode} onValueChange={(value: 'include' | 'exclude') => setTargetingMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="include">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Include - Show ads here</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="exclude">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600" />
                      <span>Exclude - Don't show ads here</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coverage Type */}
            <div className="space-y-2">
              <Label>Coverage Type</Label>
              <Select value={coverageType} onValueChange={(value: 'radius' | 'full') => setCoverageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Area - City/Region boundaries</SelectItem>
                  <SelectItem value="radius">Radius - Specific distance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Radius Input (only if radius selected) */}
            {coverageType === 'radius' && (
              <div className="space-y-2">
                <Label>Radius (miles)</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  placeholder="25"
                />
                <p className="text-xs text-muted-foreground">
                  Target people within {radiusMiles} miles of the location
                </p>
              </div>
            )}

            {/* Location Search */}
            <div className="space-y-2">
              <Label>Search Location</Label>
              <div className="relative">
                <Input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search countries, states, or cities..."
                  className="pr-10"
                />
                {locationLoading && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}

                {/* Autocomplete Suggestions */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.key}
                        onClick={() => handleAddLocation(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{suggestion.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{suggestion.type}</div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!locationSearch && (
                <p className="text-xs text-muted-foreground">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Message */}
        {!isValid && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Add at least 1 included location to continue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Location Card Component
 */
function LocationCard({
  location,
  onRemove,
  isExcluded = false,
}: {
  location: LocationTargeting
  onRemove: (id: string) => void
  isExcluded?: boolean
}) {
  const getCoverageLabel = () => {
    if (location.coverage === 'radius' && location.radius) {
      return `${location.radius} mile radius`
    }
    return `Full ${location.type}`
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      isExcluded ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          isExcluded ? "bg-red-600" : "bg-green-600"
        )}>
          {isExcluded ? (
            <X className="h-4 w-4 text-white" />
          ) : (
            <Check className="h-4 w-4 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-medium truncate">{location.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{getCoverageLabel()}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(location.id)}
        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

