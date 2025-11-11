import { gameIconMap } from "@/components/sidebar/game-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import { useSendFriendRequest } from "@/hooks/use-friends";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import {
  LucideChevronDown,
  LucideLoaderCircle,
  LucideTrophy,
  LucideUserPlus,
} from "lucide-react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function SocialUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useProfile(userId!);
  if (!userId) {
    navigate("/social");
    return;
  }

  if (isLoading || error || !data) return;
  data.games = [
    {
      id: "game-rapid-2024-06-05",
      gameType: "rapid",
      exactGameType: "15 | 10",
      outcome: "checkmate",
      winner: "w",
      moves: 58,
      whiteTimer: 15 * 60 * 1000,
      blackTimer: 15 * 60 * 1000 - 25_000,
      messages: [
        { userId: "usr_profile", content: "gl hf!" },
        { userId: "usr_mika", content: "have fun 🤝" },
      ],
      createdAt: Date.parse("2024-06-05T18:32:00Z"),
      white: {
        id: "usr_profile",
        name: "Nora Valette",
        email: "nora@example.com",
        emailVerified: true,
        image: "/avatars/nora.png",
        puzzleLevel: 11,
        bio: "Aggressive Catalan lover.",
        createdAt: Date.parse("2024-02-01T09:00:00Z"),
        updatedAt: Date.parse("2024-06-04T14:12:00Z"),
        elos: [
          { gameType: "blitz", elo: 1784 },
          { gameType: "rapid", elo: 1862 },
        ],
      },
      black: {
        id: "usr_mika",
        name: "Mika Duran",
        email: "mika@example.com",
        emailVerified: true,
        image: "/avatars/mika.png",
        puzzleLevel: 9,
        bio: "Najdorf main.",
        createdAt: Date.parse("2024-01-12T16:20:00Z"),
        updatedAt: Date.parse("2024-05-28T19:45:00Z"),
        elos: [
          { gameType: "blitz", elo: 1705 },
          { gameType: "rapid", elo: 1740 },
        ],
      },
    },
    {
      id: "game-blitz-2024-05-31",
      gameType: "blitz",
      exactGameType: "5 min",
      outcome: "timeout",
      winner: "b",
      moves: 37,
      whiteTimer: 5 * 60 * 1000,
      blackTimer: 5 * 60 * 1000,
      messages: [{ userId: "usr_omar", content: "flagged :(" }],
      createdAt: Date.parse("2024-05-31T21:10:00Z"),
      white: {
        id: "usr_omar",
        name: "Omar Reis",
        email: "omar@example.com",
        emailVerified: true,
        image: "/avatars/omar.png",
        puzzleLevel: 7,
        bio: "Prefers positional squeezes.",
        createdAt: Date.parse("2023-12-03T11:05:00Z"),
        updatedAt: Date.parse("2024-05-31T21:05:00Z"),
        elos: [
          { gameType: "blitz", elo: 1650 },
          { gameType: "rapid", elo: 1713 },
        ],
      },
      black: {
        id: "usr_profile",
        name: "Nora Valette",
        email: "nora@example.com",
        emailVerified: true,
        image: "/avatars/nora.png",
        puzzleLevel: 11,
        bio: "Aggressive Catalan lover.",
        createdAt: Date.parse("2024-02-01T09:00:00Z"),
        updatedAt: Date.parse("2024-06-04T14:12:00Z"),
        elos: [
          { gameType: "blitz", elo: 1784 },
          { gameType: "rapid", elo: 1862 },
        ],
      },
    },
    {
      id: "game-rapid-2024-05-27",
      gameType: "rapid",
      exactGameType: "10 | 5",
      outcome: "draw",
      winner: null,
      moves: 62,
      whiteTimer: 10 * 60 * 1000,
      blackTimer: 10 * 60 * 1000,
      messages: [
        { userId: "usr_ivy", content: "perpétuel incoming?" },
        { userId: "usr_profile", content: "gg!" },
      ],
      createdAt: Date.parse("2024-05-27T15:05:00Z"),
      white: {
        id: "usr_profile",
        name: "Nora Valette",
        email: "nora@example.com",
        emailVerified: true,
        image: "/avatars/nora.png",
        puzzleLevel: 11,
        bio: "Aggressive Catalan lover.",
        createdAt: Date.parse("2024-02-01T09:00:00Z"),
        updatedAt: Date.parse("2024-06-04T14:12:00Z"),
        elos: [
          { gameType: "blitz", elo: 1784 },
          { gameType: "rapid", elo: 1862 },
        ],
      },
      black: {
        id: "usr_ivy",
        name: "Ivy Chen",
        email: "ivy@example.com",
        emailVerified: true,
        image: "/avatars/ivy.png",
        puzzleLevel: 10,
        bio: "Queen of endgames.",
        createdAt: Date.parse("2024-03-08T08:15:00Z"),
        updatedAt: Date.parse("2024-05-29T07:10:00Z"),
        elos: [
          { gameType: "blitz", elo: 1768 },
          { gameType: "rapid", elo: 1831 },
        ],
      },
    },
    {
      id: "game-blitz-2024-05-21",
      gameType: "bullet",
      exactGameType: "3 min",
      outcome: "resign",
      winner: "b",
      moves: 18,
      whiteTimer: 3 * 60 * 1000,
      blackTimer: 3 * 60 * 1000,
      messages: [{ userId: "usr_leo", content: "mouse slip :(" }],
      createdAt: Date.parse("2024-05-21T09:47:00Z"),
      white: {
        id: "usr_leo",
        name: "Leo Ackermann",
        email: "leo@example.com",
        emailVerified: false,
        image: "/avatars/leo.png",
        puzzleLevel: 6,
        bio: "",
        createdAt: Date.parse("2024-04-02T12:40:00Z"),
        updatedAt: Date.parse("2024-05-18T12:00:00Z"),
        elos: [
          { gameType: "blitz", elo: 1588 },
          { gameType: "rapid", elo: 1660 },
        ],
      },
      black: {
        id: "usr_profile",
        name: "Nora Valette",
        email: "nora@example.com",
        emailVerified: true,
        image: "/avatars/nora.png",
        puzzleLevel: 11,
        bio: "Aggressive Catalan lover.",
        createdAt: Date.parse("2024-02-01T09:00:00Z"),
        updatedAt: Date.parse("2024-06-04T14:12:00Z"),
        elos: [
          { gameType: "blitz", elo: 1784 },
          { gameType: "rapid", elo: 1862 },
        ],
      },
    },
    {
      id: "game-rapid-2024-05-14",
      gameType: "rapid",
      exactGameType: "10 | 5",
      outcome: "checkmate",
      winner: "b",
      moves: 54,
      whiteTimer: 10 * 60 * 1000,
      blackTimer: 10 * 60 * 1000 - 35_000,
      messages: [{ userId: "usr_rui", content: "nice pawn storm" }],
      createdAt: Date.parse("2024-05-14T12:20:00Z"),
      white: {
        id: "usr_profile",
        name: "Nora Valette",
        email: "nora@example.com",
        emailVerified: true,
        image: "/avatars/nora.png",
        puzzleLevel: 11,
        bio: "Aggressive Catalan lover.",
        createdAt: Date.parse("2024-02-01T09:00:00Z"),
        updatedAt: Date.parse("2024-06-04T14:12:00Z"),
        elos: [
          { gameType: "blitz", elo: 1784 },
          { gameType: "rapid", elo: 1862 },
        ],
      },
      black: {
        id: "usr_rui",
        name: "Rui Batista",
        email: "rui@example.com",
        emailVerified: true,
        image: "/avatars/rui.png",
        puzzleLevel: 8,
        bio: "Shakh fan.",
        createdAt: Date.parse("2024-01-25T10:42:00Z"),
        updatedAt: Date.parse("2024-05-30T11:05:00Z"),
        elos: [
          { gameType: "blitz", elo: 1735 },
          { gameType: "rapid", elo: 1792 },
        ],
      },
    },
  ];

  data.bio =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras massa nulla, accumsan ut imperdiet ac, volutpat in arcu. Cras aliquam dictum fringilla. Suspendisse auctor urna non ante sodales, a mollis felis volutpat. Donec dignissim lorem et nunc efficitur ullamcorper. Donec arcu justo ";
  const [hasSendRequest, setHasSendRequest] = React.useState(false);
  const { isSending, sendFriendRequest } = useSendFriendRequest();
  const handleSending = async () => {
    const { error } = await sendFriendRequest(userId);
    if (error) {
      console.error(error);
      return;
    }
    setHasSendRequest(true);
  };

  return (
    <div className="flex flex-col w-full max-w-md ">
      <div className="grid gap-2 grid-flow-row grid-cols-1">
        <div className="flex gap-2 items-center col-span-1">
          <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <UserAvatar className="" url={data.image} name={data.name} />

              <p className="font-semibold">{data.name}</p>
            </div>
            {data.bio && (
              <p className="text-muted-foreground text-sm">{data.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {data.elos.map((elo) => {
            const Icon = gameIconMap[elo.gameType];
            return (
              <div className="flex gap-2 px-4 py-2 bg-card border rounded-lg text-sm items-center flex-1 justify-center">
                <Icon
                  className="size-5"
                  style={{
                    color: `var(--${elo.gameType}-color)`,
                  }}
                />
                <p className="font-semibold">{elo.elo}</p>
              </div>
            );
          })}
        </div>
        {!hasSendRequest && (
          <Button className="" disabled={isSending} onClick={handleSending}>
            {isSending ? (
              <LucideLoaderCircle className="animate-spin" />
            ) : (
              "Send a friend request"
            )}
          </Button>
        )}
        <Card className="">
          <CardHeader className="">
            <CardTitle>Game history</CardTitle>
            <CardDescription>
              Here's the last games of {data.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <ScrollArea className="overflow-auto">
              <div className="flex flex-col">
                {data.games.map((g) => {
                  const Icon = gameIconMap[g.gameType];
                  return (
                    <Link
                      className={cn(
                        "  p-2 rounded-xl grid grid-cols-2 justify-between items-center hover:bg-accent transition-opacity flex-1  min-h-0 ",
                      )}
                      to={`/game/${g.id}`}
                    >
                      <div className="text-sm space-y-1">
                        <div className="flex gap-1 bg-white-square text-background px-2 rounded-lg w-fit">
                          <p className="line-clamp-1 text-ellipsis">
                            {g.white.name}
                          </p>{" "}
                          - <p>{g.white.elos[0].elo}</p>
                        </div>
                        <div className="flex gap-1 bg-black-square px-2 rounded-lg w-fit">
                          <p className="line-clamp-1 text-ellipsis">
                            {g.black.name}
                          </p>{" "}
                          - <p>{g.black.elos[0].elo}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 h-full justify-self-end">
                        <div className="px-2 rounded-lg border flex items-center gap-2 pr-3 h-full">
                          <Icon
                            className="size-6"
                            style={{
                              color: `var(--${g.gameType}-color)`,
                            }}
                          />
                          <p className="text-sm text-muted-foreground font-semibold">
                            {g.exactGameType}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "aspect-square px-1 rounded-lg flex items-center justify-center",
                            g.winner == "w"
                              ? "text-background bg-white-square"
                              : "bg-black-square",
                          )}
                        >
                          <LucideTrophy />
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <Button variant={"ghost"}>
                  <LucideChevronDown />
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
