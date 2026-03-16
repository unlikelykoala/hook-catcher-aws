import {
  NavigationMenu,
  // NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { useHideOnScrollDown } from "@/hooks/useHideOnScrollDown"
import { type ReactNode } from "react"
import { FishingHook } from "lucide-react"
import { Link } from "react-router"

export default function NavBar({ children }: { children?: ReactNode }) {
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
        <div className="flex items-center gap-2">
          {/* <BasketsDropdown /> */}
          {children}
        </div>
      </NavigationMenu>
    </div>
  )
}

// function BasketsDropdown() {
//   const placeholder = [
//     {
//       title: "abc",
//       href: "abc",
//       count: 123,
//     },
//     {
//       title: "lorem",
//       href: "lorem",
//       count: 42,
//     },
//     {
//       title: "ipsum",
//       href: "ipsum",
//       count: 0,
//     },
//   ]
//   return (
//     <NavigationMenu >
//       <NavigationMenuList>
//         <NavigationMenuItem className="flex">
//           <NavigationMenuTrigger
//             onPointerMove={(e) => e.preventDefault()}
//             onPointerLeave={(e) => e.preventDefault()}
//           >
//             Baskets
//           </NavigationMenuTrigger>
//           <NavigationMenuContent>
//             <ul className="grid w-50 gap-2">
//               {placeholder.map((component) => (
//                 <MenuListItem
//                   key={component.title}
//                   title={component.title}
//                   href={component.href}
//                 >
//                   {component.count} requests
//                 </MenuListItem>
//               ))}
//             </ul>
//           </NavigationMenuContent>
//         </NavigationMenuItem>
//       </NavigationMenuList>
//     </NavigationMenu>
//   )
// }

// function MenuListItem({
//   title,
//   children,
//   href,
//   ...props
// }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
//   return (
//     <li {...props}>
//       <NavigationMenuLink href={href}>
//         <div className="flex flex-col gap-1 text-sm">
//           <div className="leading-none font-medium">{title}</div>
//           <div className="line-clamp-2 text-muted-foreground">{children}</div>
//         </div>
//       </NavigationMenuLink>
//     </li>
//   )
// }
