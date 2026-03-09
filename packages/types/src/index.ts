export interface Flag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  users?: string[]
  segments?: string[]
}

export interface CreateFlagInput {
  key: string
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
  segments?: string[]
}

export interface UpdateFlagInput {
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
  segments?: string[]
}

export interface Segment {
  id: string
  projectId: string
  name: string
  users?: string[]
  createdAt: string
}

export interface CreateSegmentInput {
  name: string
  users?: string[]
}

export interface UpdateSegmentInput {
  name?: string
  users?: string[]
}
