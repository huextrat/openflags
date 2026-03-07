export interface Flag {
  id: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  environment: string
  users?: string[]
}

export interface CreateFlagInput {
  key: string
  environment: string
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}

export interface UpdateFlagInput {
  enabled?: boolean
  rolloutPercentage?: number
  users?: string[]
}
