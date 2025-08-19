import { Badge } from "@/components/ui/badge"
import { Stethoscope, User, Shield } from "lucide-react"

interface RoleBadgeProps {
  role: "patient" | "doctor" | "admin"
  size?: "sm" | "md" | "lg"
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = {
    patient: {
      label: "Patient",
      icon: User,
      variant: "secondary" as const,
    },
    doctor: {
      label: "Doctor",
      icon: Stethoscope,
      variant: "default" as const,
    },
    admin: {
      label: "Admin",
      icon: Shield,
      variant: "destructive" as const,
    },
  }

  const { label, icon: Icon, variant } = config[role]
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={iconSize} />
      {label}
    </Badge>
  )
}
