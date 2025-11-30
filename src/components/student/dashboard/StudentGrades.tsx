import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Grade {
  id: string;
  course: {
    id: string;
    title: string;
  };
  assessmentTitle: string;
  score: number;
  maxScore: number;
  grade: string;
  submittedAt: string;
}

interface StudentGradesProps {
  grades: Grade[];
  overallGPA: number;
}

export default function StudentGrades({ grades, overallGPA }: StudentGradesProps) {
  // Calculate statistics
  const averageScore = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length
    : 0;

  const courseGrades = grades.reduce((acc, grade) => {
    const courseId = grade.course.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        courseTitle: grade.course.title,
        grades: [],
        average: 0,
      };
    }
    acc[courseId].grades.push(grade);
    return acc;
  }, {} as Record<string, { courseTitle: string; grades: Grade[]; average: number }>);

  // Calculate course averages
  Object.keys(courseGrades).forEach(courseId => {
    const course = courseGrades[courseId];
    course.average = course.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / course.grades.length;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-blue-100 text-blue-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Grades & Performance</h2>
        <p className="text-gray-600 mt-1">Track your academic progress</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Overall GPA</p>
                <p className={`text-3xl font-bold ${getGradeColor(overallGPA * 25)}`}>
                  {overallGPA.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Average Score</p>
                <p className={`text-3xl font-bold ${getGradeColor(averageScore)}`}>
                  {averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Breakdown */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-900">
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(courseGrades).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(courseGrades).map(([courseId, course]) => (
                <div key={courseId} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">{course.courseTitle}</h3>
                    <Badge className={getGradeBadgeColor(course.average)}>
                      {course.average.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={course.average} className="h-2 mb-2" />
                  <p className="text-sm text-gray-500">{course.grades.length} assessments</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No grades available yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-900">
            Recent Assessments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {grades.length > 0 ? (
            <div className="space-y-4">
              {grades.slice(0, 5).map((grade) => {
                const percentage = (grade.score / grade.maxScore) * 100;
                return (
                  <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{grade.assessmentTitle}</h4>
                      <p className="text-sm text-gray-600">{grade.course.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(grade.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                        {grade.score}/{grade.maxScore}
                      </p>
                      <Badge className={`${getGradeBadgeColor(percentage)} mt-1`}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">No grades yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete assessments to see your grades here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
