import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NewBinCreatorProps = {
  onCreateBin: () => void | Promise<void>;
};

export function NewBinCreator({ onCreateBin }: NewBinCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const title = "New Bin";
  const description = "Create a bin to collect and inspect HTTP requests";

  async function handleCreateBin() {
    setIsCreating(true);
    try {
      await onCreateBin();
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-5xl rounded-[2rem] border bg-card shadow-sm">
        <CardHeader className="justify-items-center px-6 pb-4 pt-10 text-center sm:px-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-balance text-center text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        </CardHeader>

        <CardContent className="flex justify-center px-6 pb-10 sm:px-10">
          <div className="flex w-full max-w-2xl justify-center">
            <Button
              type="button"
              onClick={handleCreateBin}
              disabled={isCreating}
              className="h-12 cursor-pointer rounded-xl px-6 text-base hover:bg-primary/80 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create Bin"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
