# Dashboard UI Component Library

This directory contains shared UI components specifically designed for the student dashboard enhancement project. These components follow the design specifications outlined in `.kiro/specs/student-dashboard-enhancements/design.md`.

## Components

### DashboardCard

A versatile card component with built-in loading and error states.

**Props:**

- `title` (string, required): Card title
- `subtitle` (string, optional): Card subtitle
- `icon` (ReactNode, optional): Icon to display next to title
- `children` (ReactNode, required): Card content
- `actions` (ReactNode, optional): Action buttons/elements
- `loading` (boolean, optional): Show loading state
- `error` (Error, optional): Show error state with message
- `className` (string, optional): Additional CSS classes

**Example:**

```tsx
<DashboardCard
  title="Course Progress"
  subtitle="Your learning journey"
  icon={<BookOpen className="w-6 h-6" />}
  loading={isLoading}
  error={error}
>
  <div>Card content here</div>
</DashboardCard>
```

### StatWidget

A statistics widget with trend indicators and color variants.

**Props:**

- `label` (string, required): Widget label
- `value` (string | number, required): Display value
- `icon` (ReactNode, required): Icon element
- `trend` (object, optional): Trend data with `value` (number) and `direction` ("up" | "down")
- `color` ("blue" | "green" | "orange" | "purple" | "red", required): Color theme
- `onClick` (function, optional): Click handler (makes widget clickable)
- `className` (string, optional): Additional CSS classes

**Example:**

```tsx
<StatWidget
  label="Active Courses"
  value={5}
  icon={<BookOpen />}
  color="blue"
  trend={{ value: 12, direction: "up" }}
  onClick={() => console.log("Clicked")}
/>
```

### ProgressBar

An animated progress bar with customizable appearance.

**Props:**

- `value` (number, required): Current progress value
- `max` (number, optional, default: 100): Maximum value
- `label` (string, optional): Progress label
- `showPercentage` (boolean, optional, default: false): Show percentage text
- `color` (string, optional): Custom color class (e.g., "bg-blue-500")
- `size` ("sm" | "md" | "lg", optional, default: "md"): Bar size
- `animated` (boolean, optional, default: true): Enable animations
- `className` (string, optional): Additional CSS classes

**Example:**

```tsx
<ProgressBar
  value={75}
  label="Course Completion"
  showPercentage
  size="md"
  animated
/>
```

**Color Behavior:**

- If no custom color is provided, the bar automatically changes color based on percentage:
  - 75-100%: Green
  - 50-74%: Blue
  - 25-49%: Orange
  - 0-24%: Red

### Badge

A badge component with multiple color variants.

**Props:**

- `variant` (string, optional): Badge style variant
  - Standard: "default", "accent", "secondary", "destructive", "outline"
  - Status: "success", "warning", "info"
  - Colors: "blue", "green", "orange", "purple", "red"
- `className` (string, optional): Additional CSS classes
- `children` (ReactNode): Badge content

**Example:**

```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="blue">In Progress</Badge>
<Badge variant="warning">Due Soon</Badge>
```

### Button

An enhanced button component with loading states.

**Props:**

- `variant` (string, optional): Button style variant
  - "default", "accent", "outline", "destructive", "secondary", "ghost", "link"
- `size` ("sm" | "default" | "lg" | "icon", optional): Button size
- `loading` (boolean, optional, default: false): Show loading state
- `loadingText` (string, optional): Text to show when loading
- `disabled` (boolean, optional): Disable button
- `asChild` (boolean, optional): Render as child component
- `className` (string, optional): Additional CSS classes
- All standard button HTML attributes

**Example:**

```tsx
<Button variant="default" size="lg">
  Click Me
</Button>

<Button loading loadingText="Saving...">
  Save Changes
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>
```

## Usage

### Importing Components

```tsx
// Import individual components
import { DashboardCard } from "@/components/ui/dashboard-card";
import { StatWidget } from "@/components/ui/stat-widget";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Or import from the index
import {
  DashboardCard,
  StatWidget,
  ProgressBar,
  Badge,
  Button,
} from "@/components/ui/dashboard";
```

### Complete Example

```tsx
import {
  DashboardCard,
  StatWidget,
  ProgressBar,
  Button,
  Badge,
} from "@/components/ui/dashboard";
import { BookOpen, TrendingUp, Award } from "lucide-react";

export function MyDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatWidget
          label="Active Courses"
          value={5}
          icon={<BookOpen />}
          color="blue"
          trend={{ value: 12, direction: "up" }}
        />
        <StatWidget
          label="Average Progress"
          value="78%"
          icon={<TrendingUp />}
          color="green"
        />
        <StatWidget
          label="Achievements"
          value={24}
          icon={<Award />}
          color="purple"
        />
      </div>

      {/* Progress Card */}
      <DashboardCard
        title="Course Progress"
        subtitle="Your learning journey"
        icon={<BookOpen className="w-6 h-6 text-blue-600" />}
        actions={<Badge variant="success">Active</Badge>}
      >
        <div className="space-y-4">
          <ProgressBar
            value={75}
            label="Introduction to React"
            showPercentage
          />
          <ProgressBar value={45} label="Advanced TypeScript" showPercentage />
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
```

## Demo

To see all components in action, check out the demo file:

```tsx
import { DashboardComponentsDemo } from "@/components/ui/dashboard/demo";
```

## Testing

All components have comprehensive unit tests. Run tests with:

```bash
npm test -- --testPathPattern="dashboard-components.test"
```

## Design Specifications

These components implement the design specifications from:

- Requirements: `.kiro/specs/student-dashboard-enhancements/requirements.md`
- Design: `.kiro/specs/student-dashboard-enhancements/design.md`

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader compatibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- Tailwind CSS 3+
- Lucide React (for icons)
- class-variance-authority (for Badge and Button variants)
- @radix-ui/react-slot (for Button asChild prop)
