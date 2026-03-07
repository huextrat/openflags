export interface Flag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  users?: string[]
}

export interface CreateFlagInput {
  key: string
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}

export interface UpdateFlagInput {
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}
