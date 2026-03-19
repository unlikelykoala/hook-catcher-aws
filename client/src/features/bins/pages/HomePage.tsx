import { useEffect, useState } from "react"

import NavBar from "@/components/layout/NavBar"
import * as binsApi from "@/features/bins/api/bins"
import { BinList } from "@/features/bins/components/BinList"
import {
  CreateBinResultModal,
  type CreateBinResult,
} from "@/features/bins/components/CreateBinResultModal"
import { NewBinCreator } from "@/features/bins/components/NewBinCreator"
import type { PersistedBin } from "@/features/bins/types"

export function HomePage() {
  const [bins, setBins] = useState<PersistedBin[]>([])
  const [createResult, setCreateResult] = useState<CreateBinResult | null>(null)

  useEffect(() => {
    async function loadBins() {
      try {
        setBins(await binsApi.getAllBins())
      } catch (error) {
        console.error("Failed to load bins", error)
      }
    }

    void loadBins()
  }, [])

  async function handleCreateBin() {
    try {
      const createBinResponse = await binsApi.createBin()

      setBins((currentBins) => [createBinResponse.bin, ...currentBins])
      setCreateResult({ status: "success", bin: createBinResponse.bin })
    } catch {
      setCreateResult({ status: "error" })
    }
  }

  return (
    <>
      <NavBar />
      <NewBinCreator onCreateBin={handleCreateBin} />
      <BinList bins={bins} />
      <CreateBinResultModal
        result={createResult}
        onClose={() => setCreateResult(null)}
      />
    </>
  )
}

export default HomePage
