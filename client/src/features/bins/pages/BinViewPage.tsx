import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  CalendarDays,
  CircleSlash2,
  Clock,
  RefreshCwIcon,
  RotateCwIcon,
  Shredder,
  Trash,
  Trash2,
} from "lucide-react"

import CopyButton from "@/components/common/CopyButton"
import NavBar from "@/components/layout/NavBar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import * as binsApi from "@/features/bins/api/bins"
import { useBinWebSocket } from "@/features/bins/hooks/useBinWebSocket"
import { formatRequestBody } from "@/features/bins/lib/formatters"
import { getSendUrl } from "@/features/bins/lib/urls"
import type { BinWithRequests, RequestDocument } from "@/features/bins/types"

export function BinViewPage() {
  const [bin, setBin] = useState<BinWithRequests | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const navigate = useNavigate()

  async function loadBin(binId: string) {
    try {
      setError(null)
      setBin(await binsApi.getBin(binId))
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : `Failed to fetch bin ${binId}`

      setError(message)
      setBin(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBin(binId: string | undefined) {
    if (!binId) return

    await binsApi.deleteBin(binId)
    navigate("/")
    toast.success(`Bin ${binId} has been deleted`)
  }

  async function handleRefreshBin() {
    if (!id) return

    setLoading(true)
    await loadBin(id)
  }

  useEffect(() => {
    if (!id) return

    const binId = id
    let isSubscribed = true

    async function fetchBin() {
      try {
        const nextBin = await binsApi.getBin(binId)

        if (isSubscribed) {
          setError(null)
          setBin(nextBin)
        }
      } catch (nextError) {
        if (isSubscribed) {
          const message =
            nextError instanceof Error
              ? nextError.message
              : `Failed to fetch bin ${binId}`

          setError(message)
          setBin(null)
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    void fetchBin()

    return () => {
      isSubscribed = false
    }
  }, [id])

  useBinWebSocket({
    binId: id,
    onNewRequest: (request) => {
      setBin((currentBin) => {
        if (!currentBin) return currentBin

        return {
          ...currentBin,
          requests: [request, ...currentBin.requests],
        }
      })
    },
  })

  return (
    <div>
      <NavBar>
        <BinActions
          onDeleteBin={() => handleDeleteBin(id)}
          onRefreshBin={handleRefreshBin}
        />
      </NavBar>
      <BinInfoHeader bin={bin} />
      {loading ? (
        <Spinner className="mx-auto size-14 min-h-150" />
      ) : error ? (
        <EmptyRequestList message={error} />
      ) : (
        <RequestList requests={bin?.requests ?? null} />
      )}
    </div>
  )
}

function BinInfoHeader({ bin }: { bin: BinWithRequests | null }) {
  const binId = bin?.bin.id ?? ""
  const binUrl = bin ? getSendUrl(bin.bin.id) : ""

  return (
    <section className="mx-auto max-w-4xl p-3">
      <h1 className="text-2xl font-bold">Bin: {binId}</h1>
      <p>
        Bin URL: {binUrl}
        {bin ? <CopyButton content={binUrl} /> : null}
      </p>
      <p>Request Count: {bin?.requests.length ?? 0}</p>
    </section>
  )
}

function RequestList({ requests }: { requests: RequestDocument[] | null }) {
  if (!requests || requests.length === 0) return <EmptyRequestList />

  return (
    <section className="mx-auto grid max-w-4xl grid-cols-[repeat(auto-fill,minmax(28rem,1fr))] items-start">
      {requests.map((request) => (
        <RequestDetails key={request._id} request={request} />
      ))}
    </section>
  )
}

function EmptyRequestList({ message }: { message?: string }) {
  return (
    <div className="flex h-full min-h-150 items-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleSlash2 />
          </EmptyMedia>
          <EmptyTitle>{message ? "Unable to load bin" : "No data"}</EmptyTitle>
          <EmptyDescription>
            {message ??
              "Send a request to the above URL and your request will appear here!"}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function RequestDetails({ request }: { request: RequestDocument }) {
  return (
    <section>
      <Card className="m-4 max-w-md">
        <CardHeader>
          <CardTitle>{request.method}</CardTitle>
          <TimeStamp dateTime={request.received_at} />
          <DateStamp received={request.received_at} />
        </CardHeader>
        <CardContent>
          <RequestPath path={request.path} />
          <RequestHeadersAndBody request={request} />
        </CardContent>
      </Card>
    </section>
  )
}

function RequestHeadersAndBody({ request }: { request: RequestDocument }) {
  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="headers">
        <AccordionTrigger>Headers</AccordionTrigger>
        <AccordionContent>
          <SimpleCodeBlock copyButtonVisible={false}>
            {Object.entries(request.headers).map(([header, value]) => (
              <div className="m-0" key={header}>{`${header}: ${value}`}</div>
            ))}
          </SimpleCodeBlock>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="body">
        <AccordionTrigger>Body</AccordionTrigger>
        <AccordionContent>
          <SimpleCodeBlock content={formatRequestBody(request.body)} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

type SimpleCodeBlockProps = {
  content?: string
  copyButtonVisible?: boolean
  children?: ReactNode
}

function SimpleCodeBlock({
  content,
  copyButtonVisible = true,
  children,
}: SimpleCodeBlockProps) {
  return (
    <Item className="bg-secondary">
      <ItemContent>
        {content ? <pre>{content}</pre> : null}
        {children}
      </ItemContent>
      {copyButtonVisible && (content || children) ? (
        <CopyButton content={content ?? null} />
      ) : null}
    </Item>
  )
}

function RequestPath({ path }: { path: string }) {
  return (
    <Item className="bg-primary text-primary-foreground">
      <ItemContent>
        <p>{path}</p>
      </ItemContent>
      <CopyButton content={path} />
    </Item>
  )
}

function TimeStamp({ dateTime }: { dateTime: Date }) {
  return (
    <Item>
      <ItemMedia variant="icon">
        <Clock />
      </ItemMedia>
      <ItemContent>
        <time>{dateTime.toTimeString()}</time>
      </ItemContent>
    </Item>
  )
}

function DateStamp({ received }: { received: Date }) {
  return (
    <Item>
      <ItemMedia variant="icon">
        <CalendarDays />
      </ItemMedia>
      <ItemContent>
        <time>{received.toDateString()}</time>
      </ItemContent>
    </Item>
  )
}

function notYetImplemented(event: MouseEvent) {
  event.preventDefault()
  toast.error("Not yet implemented")
}

type BinActionsProps = {
  onDeleteBin: () => void
  onRefreshBin: () => void
}

function BinActions({ onDeleteBin, onRefreshBin }: BinActionsProps) {
  return (
    <ButtonGroup>
      <ButtonGroup className="flex">
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          title="Refresh"
          onClick={onRefreshBin}
        >
          <RefreshCwIcon />
        </Button>
        <Button
          variant="default"
          size="icon"
          aria-label="Auto-refresh"
          title="Auto-refresh"
          onClick={notYetImplemented}
        >
          <RotateCwIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              aria-label="More Options"
              title="Deletion Menu"
            >
              <Trash />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={notYetImplemented}>
                <Shredder />
                Delete all requests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteBin}>
                <Trash2 />
                Destroy basket
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}

export default BinViewPage
