import {
  CalendarIcon,
  ClipboardListIcon,
  HomeIcon,
  UsersIcon,
} from "lucide-react"

import type { NavigationItem } from "@/components/standard/navigation"

/** Destinations shared by the Navigation Bar and Navigation Rail demos. */
export const DESTINATIONS: NavigationItem[] = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "jobs", label: "Jobs", icon: <ClipboardListIcon />, badge: 3 },
  { id: "schedule", label: "Schedule", icon: <CalendarIcon /> },
  { id: "crew", label: "Crew", icon: <UsersIcon />, badge: true },
]
