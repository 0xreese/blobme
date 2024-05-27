"use client";

import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMiner } from "@/hooks/use-miner";
import { privateKeyAtom } from "@/store";

export function CheckBurner() {
  const privateKey = useAtomValue(privateKeyAtom);
  const [open, setOpen] = useState(false);
  const { generateWallet } = useMiner();

  const handleGoToGenerateWallet = () => {
    generateWallet();
    setOpen(false);
  };

  useEffect(() => {
    setOpen(!privateKey);
  }, [privateKey]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create new burner wallet?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleGoToGenerateWallet}
            className="w-full rounded-full"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}