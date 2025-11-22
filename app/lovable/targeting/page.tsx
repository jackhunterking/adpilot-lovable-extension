/**
 * Feature: Lovable Targeting Page
 * Purpose: Location and demographic targeting for ads
 */

"use client"

import { useState } from "react"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocationSearch, LocationResult } from "@/lib/hooks/use-location-search"
import { useLocationContext } from "@/lib/context/location-context"
import { Loader2, MapPin, Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Dynamically import map to avoid SSR issues
const LocationTargetingMap = dynamic(
  () => import("@/components/location-targeting-map").then(mod => mod.LocationTargetingMap),
  { ssr: false, loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" /> }
)

export default function TargetingPage() {
  const {
    searchLocations,
    loading: searchLoading,
    results,
    clearResults
  } = useLocationSearch()
  
  const {
    locations,
    excludedLocations,
    addLocation,
    excludeLocation,
    removeLocation,
    removeExcludedLocation,
    mode,
    setMode
  } = useLocationContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(65)
  const [gender, setGender] = useState<"all" | "male" | "female">("all")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    await searchLocations(searchQuery)
  }

  const handleAddLocation = (location: LocationResult) => {
    addLocation({
      id: location.id,
      name: location.name,
      type: location.type,
      country_code: location.country_code,
      region: location.region
    })
    toast.success(`Added ${location.name}`)
    clearResults()
    setSearchQuery("")
  }

  const handleExcludeLocation = (location: LocationResult) => {
    excludeLocation({
      id: location.id,
      name: location.name,
      type: location.type,
      country_code: location.country_code,
      region: location.region
    })
    toast.success(`Excluded ${location.name}`)
    clearResults()
    setSearchQuery("")
  }

  return (
    <LovableLayout requireMeta>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audience Targeting</h1>
          <p className="text-muted-foreground mt-2">
            Define who will see your ads with location and demographic targeting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Location Targeting</CardTitle>
              <CardDescription>
                Add or exclude specific locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selector */}
              <div className="space-y-2">
                <Label>Targeting Mode</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(value: "include" | "exclude") => setMode(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="include" id="include" />
                    <Label htmlFor="include" className="cursor-pointer">
                      Include Locations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exclude" id="exclude" />
                    <Label htmlFor="exclude" className="cursor-pointer">
                      Exclude Locations
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Location Search */}
              <div className="space-y-2">
                <Label>Search Locations</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter city, state, or country..."
                  />
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddLocation(result)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Include
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExcludeLocation(result)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Exclude
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Locations */}
              {locations.length > 0 && (
                <div className="space-y-2">
                  <Label>Included Locations ({locations.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <Badge key={loc.id} variant="default" className="gap-1">
                        {loc.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeLocation(loc.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Locations */}
              {excludedLocations.length > 0 && (
                <div className="space-y-2">
                  <Label>Excluded Locations ({excludedLocations.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {excludedLocations.map((loc) => (
                      <Badge key={loc.id} variant="destructive" className="gap-1">
                        {loc.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeExcludedLocation(loc.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>
                Target specific age groups and genders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Age Range */}
              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Minimum Age</Label>
                    <Select
                      value={String(ageMin)}
                      onValueChange={(value) => setAgeMin(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 48 }, (_, i) => i + 18).map((age) => (
                          <SelectItem key={age} value={String(age)}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Maximum Age</Label>
                    <Select
                      value={String(ageMax)}
                      onValueChange={(value) => setAgeMax(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 48 }, (_, i) => i + 18).map((age) => (
                          <SelectItem key={age} value={String(age)}>
                            {age}
                          </SelectItem>
                        ))}
                        <SelectItem value="65">65+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value: "all" | "male" | "female") => setGender(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">All Genders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Targeting Summary</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Age: {ageMin} - {ageMax === 65 ? "65+" : ageMax}</p>
                  <p>Gender: {gender === "all" ? "All" : gender === "male" ? "Male" : "Female"}</p>
                  <p>Locations: {locations.length} included, {excludedLocations.length} excluded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map View */}
        {locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>
                Visual representation of your targeted locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationTargetingMap
                locations={locations}
                excludedLocations={excludedLocations}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset</Button>
          <Button onClick={() => toast.success("Targeting saved!")}>
            Save Targeting
          </Button>
        </div>
      </div>
    </LovableLayout>
  )
}

