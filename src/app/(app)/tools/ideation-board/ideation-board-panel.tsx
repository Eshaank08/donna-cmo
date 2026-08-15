"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COLUMNS } from "@/lib/ideation-board-columns";
import type { IdeationCard } from "@/lib/ideation-board";
import { createCardAction, deleteCardAction, moveCardAction } from "./actions";

function BoardCard({ card }: { card: IdeationCard }) {
  const index = COLUMNS.findIndex((c) => c.key === card.status);
  const [pending, setPending] = useState(false);

  async function move(direction: "next" | "prev") {
    setPending(true);
    await moveCardAction(card.id, direction);
    setPending(false);
  }

  async function remove() {
    setPending(true);
    await deleteCardAction(card.id);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{card.title}</CardTitle>
      </CardHeader>
      {card.notes && (
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-xs whitespace-pre-wrap">
            {card.notes}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || index === 0}
            onClick={() => move("prev")}
            aria-label="Move to previous column"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || index === COLUMNS.length - 1}
            onClick={() => move("next")}
            aria-label="Move to next column"
          >
            <ArrowRightIcon />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          onClick={remove}
          aria-label="Delete card"
        >
          <Trash2Icon />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function IdeationBoardPanel({ cards }: { cards: IdeationCard[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">New card</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            key={cards.length}
            action={createCardAction}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="What's the idea?"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Format, hook, angle — whatever's useful later"
              />
            </div>
            <Button type="submit" className="self-start">
              Add card
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnCards = cards.filter((c) => c.status === column.key);
          return (
            <div key={column.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{column.title}</h2>
                <span className="text-muted-foreground text-xs">
                  {columnCards.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 min-h-16">
                {columnCards.length === 0 && (
                  <p className="text-muted-foreground text-xs">No cards.</p>
                )}
                {columnCards.map((card) => (
                  <BoardCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
