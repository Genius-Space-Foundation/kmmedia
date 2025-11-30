# Student Dashboard Enhancement - Project Setup

This document describes the project structure and dependencies set up for the student dashboard enhancements.

## Dependencies Installed

### Production Dependencies

- **@tanstack/react-query** (v5.x): Modern data fetching and caching library for React
  - Provides powerful data synchronization
  - Built-in caching strategies
  - Optimistic updates support
  - Automatic background refetching

### Development Dependencies

- **fast-check** (v3.x): Property-based testing library
  - Generates hundreds of test cases automatically
  - Finds edge cases that manual tests miss
  - Provides reproducible test failures with seeds

## TypeScript Configuration

The TypeScript configuration has been enhanced with:

### Strict Mode Settings

- `strict: true` - Enables all strict type checking options
- `strictNullChecks: true` - Strict null checking
- `strictFunctionTypes: true` - Strict function type checking
- `strictBindCallApply: true` - Strict bind/call/apply checking
- `strictPropertyInitialization: true` - Ensures class properties are initialized
- `noImplicitThis: true` - Raises error on 'this' with implied 'any' type
- `noUnusedLocals: true` - Reports errors on unused local variables
- `noUnusedParameters: true` - Reports errors on unused parameters
- `noImplicitReturns: true` - Ensures all code paths return a value
- `noFallthroughCasesInSwitch: true` - Reports errors for fallthrough cases in switch

### Path Aliases

The following path aliases are configured for cleaner imports:

```typescript
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/lib/hooks/*"],
  "@/types/*": ["./src/types/*"],
  "@/utils/*": ["./src/lib/utils/*"]
}
```

### Target and Libraries

- **Target**: ES2020 (supports modern JavaScript features including private class fields)
- **Libraries**: DOM, DOM.Iterable, ESNext, ES2020

## Tailwind CSS Configuration

Enhanced with dashboard-specific design tokens:

### Custom Spacing

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 40px
- `2xl`: 48px
- `3xl`: 64px

### Dashboard Color Palette

```css
dashboard: {
  primary: #3B82F6
  primary-light: #60A5FA
  primary-dark: #2563EB
  secondary: #8B5CF6
  secondary-light: #A78BFA
  secondary-dark: #7C3AED
  success: #10B981
  warning: #F59E0B
  error: #EF4444
  info: #06B6D4
  background: #F9FAFB
  surface: #FFFFFF
  border: #E5E7EB
}
```

### Custom Border Radius

- `dashboard-sm`: 6px
- `dashboard-md`: 8px
- `dashboard-lg`: 12px
- `dashboard-xl`: 16px

## React Query Setup

### Configuration File

Location: `src/lib/react-query.ts`

**Default Settings:**

- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry: 2 attempts
- Refetch on window focus: disabled
- Refetch on reconnect: enabled

### Query Key Factory

Centralized query key management for consistent caching:

```typescript
queryKeys.dashboard.stats(userId);
queryKeys.enrollments.list(userId);
queryKeys.deadlines.upcoming(userId);
queryKeys.achievements.recent(userId);
// ... and more
```

### Provider Component

Location: `src/components/providers/QueryProvider.tsx`

Wrap your application with this provider to enable React Query:

```tsx
import { QueryProvider } from "@/components/providers/QueryProvider";

function App() {
  return <QueryProvider>{/* Your app components */}</QueryProvider>;
}
```

## Property-Based Testing Setup

### Configuration File

Location: `src/lib/test-utils/fast-check-config.ts`

**Default Configuration:**

- Number of runs: 100 per property
- Verbose output: enabled

### Custom Arbitraries

Pre-built generators for domain-specific data:

- `arbUserId()` - Valid user IDs (UUID format)
- `arbCourseId()` - Valid course IDs
- `arbProgress()` - Progress percentages (0-100)
- `arbTimeSpent()` - Time in minutes
- `arbGrade()` - Grade scores (0-100)
- `arbStreak()` - Learning streak counts
- `arbRecentDate()` - Dates within last year
- `arbFutureDate()` - Future dates for deadlines
- `arbPastDate()` - Past dates for activities
- And many more...

### Test Scripts

```bash
# Run all tests
npm test

# Run only property-based tests
npm run test:pbt

# Run property-based tests in watch mode
npm run test:pbt:watch

# Run only unit tests (excluding property-based)
npm run test:unit

# Run tests with coverage
npm run test:coverage
```

### Example Property Test

```typescript
import * as fc from "fast-check";
import {
  runPropertyTest,
  arbProgress,
} from "@/lib/test-utils/fast-check-config";

describe("Progress Calculations", () => {
  it("Property: Progress should always be between 0 and 100", () => {
    runPropertyTest(
      fc.property(arbProgress(), (progress) => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      })
    );
  });
});
```

## Type Definitions

### Location

`src/types/dashboard.ts` - Comprehensive TypeScript interfaces for:

- User and Profile types
- Course and Enrollment types
- Deadline and Assignment types
- Achievement and Gamification types
- Notification types
- Activity types
- Recommendation types
- Analytics types
- Bookmark types
- Filter and Sort types

### Usage

```typescript
import { User, Enrollment, Deadline, Achievement } from "@/types";
```

## Directory Structure

```
src/
├── components/
│   └── providers/
│       └── QueryProvider.tsx       # React Query provider
├── lib/
│   ├── react-query.ts              # React Query configuration
│   ├── test-utils/
│   │   ├── fast-check-config.ts    # Property-based testing config
│   │   ├── README.md               # Testing documentation
│   │   └── __tests__/
│   │       └── fast-check-config.test.ts
│   └── hooks/                      # Custom React hooks
└── types/
    ├── dashboard.ts                # Dashboard type definitions
    └── index.ts                    # Type exports
```

## Next Steps

With the foundation in place, you can now:

1. Implement core utility functions (Task 2)
2. Create shared UI components (Task 3)
3. Set up data models and Prisma schema extensions (Task 4)
4. Begin implementing dashboard features with property-based tests

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Fast-check Documentation](https://github.com/dubzzz/fast-check)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Verification

To verify the setup is working correctly:

```bash
# Check TypeScript compilation
npm run type-check

# Run the fast-check configuration tests
npm test -- src/lib/test-utils/__tests__/fast-check-config.test.ts

# Start the development server
npm run dev
```

All tests should pass and the development server should start without errors.
