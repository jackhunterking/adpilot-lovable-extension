/**
 * Feature: Lovable Campaigns Page
 * Purpose: Campaign and ad management
 */

"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering (requires authentication and context)
export const dynamicParams = true
export const revalidate = 0
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCampaignOperations, Campaign, Ad } from "@/lib/hooks/use-campaign-operations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, FolderKanban, FileText, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function CampaignsPage() {
  const {
    createCampaign,
    deleteCampaign,
    listCampaigns,
    createAd,
    deleteAd,
    loading
  } = useCampaignOperations()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    const data = await listCampaigns()
    setCampaigns(data)
  }

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("Please enter a campaign name")
      return
    }

    const campaign = await createCampaign(newCampaignName)
    if (campaign) {
      toast.success("Campaign created successfully!")
      setNewCampaignName("")
      setCreateDialogOpen(false)
      loadCampaigns()
    }
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return

    const success = await deleteCampaign(campaignToDelete)
    if (success) {
      toast.success("Campaign deleted successfully!")
      setDeleteConfirmOpen(false)
      setCampaignToDelete(null)
      loadCampaigns()
    }
  }

  const confirmDelete = (campaignId: string) => {
    setCampaignToDelete(campaignId)
    setDeleteConfirmOpen(true)
  }

  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Manage your ad campaigns and monitor their performance
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first campaign to start advertising
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => confirmDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        campaign.status === "active"
                          ? "default"
                          : campaign.status === "paused"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  {campaign.initial_goal && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Goal</span>
                      <span className="text-sm capitalize">{campaign.initial_goal}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        sessionStorage.setItem('lovable_campaign_id', campaign.id)
                        toast.success(`Switched to ${campaign.name}`)
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Campaign Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Give your campaign a descriptive name to organize your ads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCampaign()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Campaign</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this campaign? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCampaign}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LovableLayout>
  )
}

