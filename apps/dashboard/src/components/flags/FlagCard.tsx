import { motion } from "framer-motion"
import { Flag, Trash2, Pencil, Users } from "lucide-react"

import type { Flag as FlagType } from "@/api"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface FlagCardProps {
  flag: FlagType
  index: number
  canEditFlags: boolean
  onToggleEnabled: (flag: FlagType) => void
  onRolloutChange: (flagId: string, value: number[]) => void
  onOpenEdit: (flag: FlagType) => void
  onDelete: (flagId: string) => void
}

export function FlagCard({
  flag,
  index,
  canEditFlags,
  onToggleEnabled,
  onRolloutChange,
  onOpenEdit,
  onDelete,
}: FlagCardProps) {
  const isActive = flag.enabled && flag.rolloutPercentage > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col lg:flex-row lg:items-center gap-6 rounded-[20px] border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] overflow-hidden",
        isActive && "shadow-[0_4px_30px_rgba(139,92,246,0.05)] border-white/10"
      )}
    >
      {/* Subtle active glow */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
      )}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent pointer-events-none" />
      )}

      {/* Flag Identity */}
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className={cn(
            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-colors",
            flag.enabled
              ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
              : "bg-white/5 border-white/10 text-white/30"
          )}
        >
          <Flag className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-[15px] font-semibold text-white tracking-tight truncate">
              {flag.key}
            </h3>
            {!flag.enabled && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50 uppercase tracking-widest">
                Off
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/40">
            <div
              className="flex items-center gap-1.5"
              title={flag.users?.length ? flag.users.join(", ") : "No specific users targeted"}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{flag.users?.length || 0} explicitly targeted</span>
            </div>
            {flag.segments && flag.segments.length > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5 text-violet-300/80">
                  <span>{flag.segments.length} segments</span>
                </div>
              </>
            )}
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="font-mono text-[10px] uppercase tracking-wider opacity-50">
              ID: {flag.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 lg:gap-10 border-t border-white/5 pt-4 lg:pt-0 lg:border-t-0 pl-[3.25rem] lg:pl-0">
        {/* Toggle */}
        <div className="flex flex-col gap-2 min-w-[5rem]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Status
          </span>
          {canEditFlags ? (
            <div className="flex items-center gap-3">
              <Switch
                checked={flag.enabled}
                onCheckedChange={() => onToggleEnabled(flag)}
                className={cn("data-[state=checked]:shadow-[0_0_15px_rgba(139,92,246,0.5)]")}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  flag.enabled ? "text-violet-300" : "text-white/40"
                )}
              >
                {flag.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ) : (
            <span
              className={cn(
                "text-xs font-medium",
                flag.enabled ? "text-violet-300" : "text-white/40"
              )}
            >
              {flag.enabled ? "Active" : "Disabled"}
            </span>
          )}
        </div>

        {/* Rollout */}
        <div className="flex flex-col gap-2 w-full lg:w-48 xl:w-64 max-w-[200px]">
          <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
            <span>Traffic</span>
            <span className="text-white/70 font-mono tracking-normal">
              {flag.rolloutPercentage}%
            </span>
          </div>
          {canEditFlags ? (
            <div className="relative pt-1 flex items-center group/slider">
              <Slider
                disabled={!flag.enabled}
                value={[flag.rolloutPercentage]}
                onValueChange={(value) => onRolloutChange(flag.id, value)}
                max={100}
                step={1}
                className={cn("transition-opacity", !flag.enabled && "opacity-40 grayscale")}
              />
            </div>
          ) : (
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 mt-1">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  flag.enabled
                    ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "bg-white/20"
                )}
                style={{ width: `${flag.rolloutPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {canEditFlags && (
          <div className="flex items-center gap-1 shrink-0 ml-auto lg:ml-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => onOpenEdit(flag)}
              title="Edit flag"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full"
              onClick={() => onDelete(flag.id)}
              title="Delete flag"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
