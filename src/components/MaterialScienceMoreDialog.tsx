import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MATERIAL_SCIENCE_DETAIL,
  materialNoteImageCandidates,
  type ElectricityMaterial,
} from "@/content/electricityMaterialScience";

type Props = {
  material: ElectricityMaterial;
};

export function MaterialScienceMoreDialog({ material }: Props) {
  const detail = MATERIAL_SCIENCE_DETAIL[material];
  const candidates = materialNoteImageCandidates(material);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setImageFailed(false);
  }, [material]);

  const src = candidates[candidateIndex] ?? candidates[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 underline-offset-4"
        >
          More
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{detail.dialogTitle}</DialogTitle>
          <DialogDescription className="text-left text-sm text-muted-foreground">
            Extended reading for the material you selected in the lab. The short note above stays on the page; this
            dialog goes deeper.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          {detail.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <figure className="mt-4 space-y-2">
          <figcaption className="text-xs font-medium text-foreground">Illustration</figcaption>
          <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-muted/20">
            {!imageFailed ? (
              <img
                key={src}
                src={src}
                alt={detail.imageAlt}
                className="mx-auto block max-h-64 w-full object-contain bg-background/80 p-2"
                loading="lazy"
                decoding="async"
                onError={() => {
                  if (candidateIndex < candidates.length - 1) {
                    setCandidateIndex((i) => i + 1);
                  } else {
                    setImageFailed(true);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">No image file found yet.</p>
                <p className="text-xs text-muted-foreground">
                  Add one of:{" "}
                  <span className="font-mono text-[11px] text-foreground">
                    {candidates.map((c) => c.split("/").pop()).join(", ")}
                  </span>
                </p>
                <p className="max-w-md text-xs text-muted-foreground">
                  Folder:{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] break-all">
                    public/images/engineering/electricity/material-notes/
                  </code>{" "}
                  — see <code className="font-mono text-[10px]">docs/electricity-material-dialog-images.md</code>.
                </p>
              </div>
            )}
          </div>
        </figure>
      </DialogContent>
    </Dialog>
  );
}
