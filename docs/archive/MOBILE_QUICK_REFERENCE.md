# Mobile-Responsive Components - Quick Reference

## Quick Start

### 1. Use Responsive Overview

```tsx
import ResponsivePersonalizedOverview from "@/components/student/dashboard/ResponsivePersonalizedOverview";

<ResponsivePersonalizedOverview
  user={user}
  enrollments={enrollments}
  upcomingDeadlines={deadlines}
  recentActivity={activity}
  achievements={achievements}
  learningStreak={streak}
  learningStats={stats}
  onContinueCourse={handleContinue}
  onViewDeadlines={handleDeadlines}
  onViewAchievements={handleAchievements}
/>;
```

### 2. Add Mobile Navigation

```tsx
import MobileNavigationMenu from "@/components/mobile/MobileNavigationMenu";

<MobileNavigationMenu
  user={user}
  notificationCount={5}
  onLogout={handleLogout}
/>;
```

### 3. Use Touch-Friendly Buttons

```tsx
import { TouchButton } from "@/components/ui/touch-button";

// Regular button (44x44px minimum)
<TouchButton onClick={handleClick}>
  Click Me
</TouchButton>

// Icon button (44x44px)
<TouchButton size="icon" variant="ghost">
  <MenuIcon className="h-5 w-5" />
</TouchButton>

// Large button (48x48px)
<TouchButton size="lg">
  Continue Learning
</TouchButton>
```

## CSS Classes

### Touch-Friendly Buttons

```tsx
<button className="touch-button">Button</button>
<button className="touch-button-icon">Icon</button>
<button className="touch-button-lg">Large</button>
```

### Touch Spacing

```tsx
<div className="touch-spacing">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Mobile Cards

```tsx
<div className="mobile-dashboard-card">Content</div>
```

## Breakpoints

| Name | Range       | Use Case                    |
| ---- | ----------- | --------------------------- |
| xs   | 0-639px     | Mobile phones               |
| sm   | 640-767px   | Large phones, small tablets |
| md   | 768-1023px  | Tablets                     |
| lg   | 1024-1279px | Small desktops              |
| xl   | 1280-1535px | Desktops                    |
| 2xl  | 1536px+     | Large desktops              |

## Touch Target Sizes

| Size        | Pixels  | Use Case                |
| ----------- | ------- | ----------------------- |
| Minimum     | 44x44px | WCAG 2.1 AA requirement |
| Recommended | 48x48px | Comfortable touch       |
| Large       | 56x56px | Primary actions         |

## Utility Functions

```tsx
import {
  getCurrentBreakpoint,
  isMobile,
  isTouchDevice,
  getTouchTargetSize,
} from "@/lib/mobile-utils";

// Check if mobile
if (isMobile()) {
  // Mobile-specific code
}

// Get current breakpoint
const breakpoint = getCurrentBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Check if touch device
if (isTouchDevice()) {
  // Touch-specific code
}

// Get touch target size
const minSize = getTouchTargetSize("min"); // 44
const recommended = getTouchTargetSize("recommended"); // 48
```

## Mobile Widgets

```tsx
import {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileShortcutGrid,
} from "@/components/mobile/MobileWidgets";

// Stats widget
<MobileStatsWidget
  title="Active Courses"
  value={5}
  icon={BookOpen}
  color="blue"
  onClick={() => {}}
/>

// Progress widget
<MobileProgressWidget
  title="Course Name"
  progress={75}
  onClick={() => {}}
/>

// Shortcut grid
<MobileShortcutGrid
  shortcuts={[
    {
      id: "continue",
      title: "Continue",
      icon: PlayCircle,
      color: "from-blue-500 to-blue-600",
      onClick: () => {},
    },
  ]}
  columns={4}
/>
```

## Accessibility Checklist

- [ ] All buttons have minimum 44x44px touch targets
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Screen reader tested
- [ ] Reduced motion respected

## Testing

```bash
# Run mobile tests
npm test -- mobile-responsive-layouts.test.tsx

# Check TypeScript
npm run type-check

# Build for production
npm run build
```

## Common Patterns

### Responsive Component

```tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    const breakpoint = getCurrentBreakpoint();
    setIsMobile(breakpoint === "xs" || breakpoint === "sm");
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

return isMobile ? <MobileView /> : <DesktopView />;
```

### Touch-Friendly List

```tsx
<div className="space-y-2">
  {items.map((item) => (
    <TouchButton
      key={item.id}
      onClick={() => handleClick(item)}
      className="w-full justify-start"
    >
      {item.name}
    </TouchButton>
  ))}
</div>
```

### Swipeable Container

```tsx
import SwipeGestureHandler from "@/components/mobile/SwipeGestureHandler";

<SwipeGestureHandler
  onSwipeLeft={() => handleSwipe("left")}
  onSwipeRight={() => handleSwipe("right")}
>
  <div>Swipeable content</div>
</SwipeGestureHandler>;
```

## Troubleshooting

### Touch targets too small

```tsx
// ❌ Bad
<button className="h-8 w-8">Icon</button>

// ✅ Good
<TouchButton size="icon">Icon</TouchButton>
```

### Menu not closing

```tsx
// Ensure overlay has onClick handler
<div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
```

### Swipe not working

```tsx
// Check if SwipeGestureHandler is wrapping content
<SwipeGestureHandler onSwipeLeft={handleSwipe}>
  <div>Content</div>
</SwipeGestureHandler>
```

## Resources

- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Integration Guide](./src/components/student/dashboard/MOBILE_INTEGRATION_GUIDE.md)
- [Implementation Summary](./MOBILE_RESPONSIVE_IMPLEMENTATION_SUMMARY.md)
