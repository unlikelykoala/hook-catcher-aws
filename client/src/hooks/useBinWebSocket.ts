import { useEffect, useEffectEvent } from "react"
import { z } from "zod"

import { backendUrl } from "@/config/env"
import { RequestDocumentSchema, type RequestDocument } from "@/types/request"

const BinWebSocketMessageSchema = z.object({
  type: z.literal("new_request"),
  payload: RequestDocumentSchema,
})

type UseBinWebSocketOptions = {
  binId?: string
  onNewRequest: (request: RequestDocument) => void
}

function getBinWebSocketUrl(binId: string): string {
  const protocol = backendUrl.protocol === "https:" ? "wss:" : "ws:"

  return `${protocol}//${backendUrl.host}/ws?binId=${encodeURIComponent(binId)}`
}

export function useBinWebSocket({
  binId,
  onNewRequest,
}: UseBinWebSocketOptions) {
  const handleNewRequest = useEffectEvent(onNewRequest)

  useEffect(() => {
    if (!binId) return

    const webSocket = new WebSocket(getBinWebSocketUrl(binId))

    webSocket.onmessage = (event) => {
      try {
        const parsedMessage = BinWebSocketMessageSchema.parse(
          JSON.parse(event.data)
        )

        handleNewRequest(parsedMessage.payload)
      } catch {
      }
    }

    webSocket.onclose = () => {}

    return () => {
      webSocket.close()
    }
  }, [binId])
}

export default useBinWebSocket
