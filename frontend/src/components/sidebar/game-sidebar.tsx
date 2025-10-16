import { Button } from "../ui/button";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";

const games = [{ name: "Bullet" }];
export default function GameSidebar() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Games</SidebarGroupLabel>
      <SidebarMenu className="grid grid-cols-2 grid-rows-2 gap-2">
        <Button className="aspect-square !h-auto" variant={"outline"}></Button>
        <Button className="aspect-square !h-auto" variant={"outline"}></Button>
        <Button className="aspect-square !h-auto" variant={"outline"}></Button>
        <Button className="aspect-square !h-auto" variant={"outline"}></Button>
      </SidebarMenu>
    </SidebarGroup>
  );
}
