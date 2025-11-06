import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useAtomValue } from "jotai";
import { chessHistoryAtom } from "@/store";

const parseHistory = (history: string[]) => {
  const result: string[][] = [];
  for (let i = 0; i < history.length; i += 2) {
    result.push(history.slice(i, i + 2));
  }
  return result;
};

export const BoardHistory = () => {
  const history = useAtomValue(chessHistoryAtom);
  const parsedHistory = parseHistory(history);
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent className="flex flex-col gap-2">
        {parsedHistory.map((t) => (
          <div className="flex gap-2">
            {t.map((m) => (
              <p>{m}</p>
            ))}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button>
          <LucideChevronLeft />
        </Button>
        <Button>
          <LucideChevronRight />
        </Button>
      </CardFooter>
    </Card>
  );
};
