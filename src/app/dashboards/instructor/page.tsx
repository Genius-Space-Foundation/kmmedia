import InstructorDashboardNew from "./instructorDashboardNew";
import ResponsiveWrapper from "@/components/ResponsiveWrapper";
import MobileInstructorPage from "./mobile/page";

export default function InstructorDashboardPage() {
  return (
    <ResponsiveWrapper mobileComponent={MobileInstructorPage}>
      <InstructorDashboardNew />
    </ResponsiveWrapper>
  );
}
