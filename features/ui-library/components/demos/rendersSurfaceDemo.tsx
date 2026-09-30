"use client"

import { CircleAlertIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLeft,
  CardMain,
  CardRight,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { RendersDemoCard } from "./rendersDemoCard"

export function RendersSurfaceDemo({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Card") {
    return (
      <>
        <RendersDemoCard>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Registry item</CardTitle>
              <CardDescription>A button you can install.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Classic style, ready to add.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Add</Button>
            </CardFooter>
          </Card>
        </RendersDemoCard>
        <RendersDemoCard label="left and right panels">
          <Card className="w-full">
            <CardLeft>Left</CardLeft>
            <CardMain>
              <CardHeader>
                <CardTitle>Crew</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Panels run the full height, like columns.</p>
              </CardContent>
              <CardFooter>Footer</CardFooter>
            </CardMain>
            <CardRight>Right</CardRight>
          </Card>
        </RendersDemoCard>
        <RendersDemoCard>
          <Alert>
            <CircleAlertIcon />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>This card stays on the page.</AlertDescription>
          </Alert>
        </RendersDemoCard>
      </>
    )
  }

  if (pieceName === "Dialog") {
    return (
      <>
        <RendersDemoCard>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share this piece</DialogTitle>
                <DialogDescription>
                  The dialog sits over the gallery. Close it to come back.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </RendersDemoCard>
        <RendersDemoCard>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Remove piece</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this piece?</AlertDialogTitle>
                <AlertDialogDescription>
                  This only closes the sample. Nothing is deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </RendersDemoCard>
      </>
    )
  }

  return null
}
