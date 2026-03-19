import { FishingHook } from "lucide-react"
import { type ReactNode } from "react"
import { Link } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useHideOnScrollDown } from "@/hooks/useHideOnScrollDown"

type NavBarProps = {
  children?: ReactNode
}

export default function NavBar({ children }: NavBarProps) {
  const hidden = useHideOnScrollDown()

  return (
    <div
      className={`sticky top-0 z-50 w-full bg-secondary transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <NavigationMenu className="mx-auto flex w-full max-w-4xl justify-between p-3 pb-1.5">
        <div>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="text-lg" asChild>
                <Link to="/">
                  <FishingHook className="relative -left-2.5 scale-150" />
                  HookCatcher
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </NavigationMenu>
    </div>
  )
}
