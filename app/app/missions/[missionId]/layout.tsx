import { MissionNav } from "@/components/mission-nav";

export default async function MissionLayout({ children, params }: { children: React.ReactNode; params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  return (
    <>
      <MissionNav missionId={missionId} />
      {children}
    </>
  );
}
