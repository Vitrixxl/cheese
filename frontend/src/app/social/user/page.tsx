import { gameIconMap } from "@/components/sidebar/game-sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { useProfile } from "@/hooks/use-profile";
import { useNavigate, useParams } from "react-router";

export default function SocialUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  if (!userId) {
    navigate("/social");
    return;
  }

  const { data, error, isLoading } = useProfile(userId);
  if (isLoading || error || !data) return;
  console.log({ data });

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center ">
            <div className="">
              <div className="bg-card border rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    className=""
                    url={data.image}
                    name={data.name}
                    size="sm"
                  />

                  <p className="font-semibold">{data.name}</p>
                </div>
              </div>
            </div>
            {data.bio && (
              <p className="text-muted-foreground text-sm">{data.bio}</p>
            )}
            {/* <Button size="lg" className="rounded-xl h-full"> */}
            {/*   <LucideUserPlus /> */}
            {/* </Button> */}
          </div>
          <div className="flex gap-2">
            {data.elos.map((elo) => {
              const Icon = gameIconMap[elo.gameType];
              return (
                <div className="flex gap-2 px-4 py-2 bg-card border rounded-xl text-sm items-center">
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
        </div>
      </div>
    </div>
  );
}
