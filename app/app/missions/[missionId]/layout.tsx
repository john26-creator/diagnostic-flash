import { MissionNav } from "@/components/mission-nav";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MissionLayout({ children, params }: { children: React.ReactNode; params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, userId: user.id },
    select: { need: { select: { status: true } }, organizationStatus: true }
  });
  const organizationLocked = mission?.need?.status !== "VALIDATED" && mission?.need?.status !== "VALIDATED_WITH_OPEN_QUESTIONS";
  const observedLocked = mission?.organizationStatus !== "ORGANIZATION_VALIDATED" && mission?.organizationStatus !== "ORGANIZATION_VALIDATED_WITH_OPEN_QUESTIONS";
  return (
    <>
      <MissionNav missionId={missionId} organizationLocked={organizationLocked} observedLocked={observedLocked} />
      {children}
    </>
  );
}
