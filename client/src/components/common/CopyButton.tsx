import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyButtonProps = {
  content: string | null
  className?: string
}

export default function CopyButton({
  content,
  className = "",
}: CopyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
      className={cn("hover:filter-[invert(20%)] active:bg-red-500", className)}
      onClick={() => navigator.clipboard.writeText(content ?? "")}
    >
      <Copy />
    </Button>
  )
}
