import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { EmployeeWeeklyReportForm } from "@/features/weekly-reports/components/employee-weekly-report-form";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MemberRole } from "@/features/members/types";
import { AlertCircle } from "lucide-react";

export default async function WeeklyReportPage() {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  // Check if user has employee role
  const memberRecords = await db
    .select()
    .from(members)
    .where(eq(members.userId, user.id));

  const isEmployee = memberRecords.some((m) => m.role === MemberRole.EMPLOYEE);

  // Show message if user is not an employee
  if (!isEmployee) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Report</h1>
            <p className="text-muted-foreground mt-1">
              Submit your weekly task report with daily descriptions
            </p>
          </div>

          <div className="flex items-center gap-4 p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                Access Restricted
              </h3>
              <p className="text-yellow-800 dark:text-yellow-300 mt-1">
                Weekly report submission is only available for users with the Employee role. 
                Please contact your administrator if you need access to this feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Report</h1>
          <p className="text-muted-foreground mt-1">
            Submit your weekly task report with daily descriptions
          </p>
        </div>

        <EmployeeWeeklyReportForm userDepartment={user.department || ""} />
      </div>
    </div>
  );
}
