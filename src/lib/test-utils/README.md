# Test Utilities

This directory contains utilities and configurations for testing the student dashboard enhancements.

## Property-Based Testing with Fast-check

Property-based testing (PBT) is a powerful testing approach where you define properties that should hold true for all valid inputs, and the testing framework generates hundreds of random test cases to verify those properties.

### Configuration

The `fast-check-config.ts` file provides:

- **Default test configuration**: 100 test runs per property
- **Custom arbitraries**: Domain-specific data generators for users, courses, enrollments, etc.
- **Helper functions**: Utilities to simplify property test writing

### Usage Example

```typescript
import * as fc from "fast-check";
import {
  runPropertyTest,
  arbProgress,
  arbTimeSpent,
} from "@/lib/test-utils/fast-check-config";

describe("Course Progress Calculations", () => {
  it("Property: Progress percentage should always be between 0 and 100", () => {
    runPropertyTest(
      fc.property(arbProgress(), (progress) => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      })
    );
  });

  it("Property: Time spent should never be negative", () => {
    runPropertyTest(
      fc.property(arbTimeSpent(), (timeSpent) => {
        expect(timeSpent).toBeGreaterThanOrEqual(0);
      })
    );
  });
});
```

### Available Arbitraries

- `arbUserId()` - Generate valid user IDs
- `arbCourseId()` - Generate valid course IDs
- `arbProgress()` - Generate progress percentages (0-100)
- `arbTimeSpent()` - Generate time spent in minutes
- `arbGrade()` - Generate grade scores (0-100)
- `arbStreak()` - Generate learning streak counts
- `arbRecentDate()` - Generate dates within the last year
- `arbFutureDate()` - Generate future dates (for deadlines)
- `arbPastDate()` - Generate past dates (for activities)
- `arbCourseStatus()` - Generate course statuses
- `arbDeadlineStatus()` - Generate deadline statuses
- `arbPriority()` - Generate priority levels
- `arbNotificationType()` - Generate notification types
- `arbActivityType()` - Generate activity types
- `arbNonEmptyString()` - Generate non-empty strings
- `arbWhitespaceString()` - Generate whitespace-only strings
- `arbInterests()` - Generate arrays of interests
- `arbSkillLevel()` - Generate skill levels
- `arbHourOfDay()` - Generate hours (0-23)
- `arbRelevanceScore()` - Generate relevance scores
- `arbAchievementPoints()` - Generate achievement points
- `arbRarity()` - Generate rarity levels

### Running Property-Based Tests

```bash
# Run all property-based tests
npm run test:pbt

# Run property-based tests in watch mode
npm run test:pbt:watch

# Run all tests (unit + property-based)
npm test

# Run only unit tests (excluding property-based)
npm run test:unit
```

### Best Practices

1. **Name property test files with `.property.test.ts` suffix** to distinguish them from unit tests
2. **Use descriptive property names** that clearly state what invariant is being tested
3. **Keep properties simple** - test one invariant per property
4. **Use appropriate arbitraries** - constrain input generation to valid domain values
5. **Document the property** - add comments explaining what the property validates
6. **Reference requirements** - link each property to its corresponding acceptance criteria

### Example Property Test Structure

```typescript
/**
 * Feature: student-dashboard-enhancements, Property 1: Personalized Greeting Generation
 * Validates: Requirements 1.1
 *
 * Property: For any user and time of day, the greeting should include the user's name
 * and an appropriate time-based greeting (morning, afternoon, evening).
 */
describe("Personalized Greeting Generation", () => {
  it("should include user name in greeting", () => {
    runPropertyTest(
      fc.property(
        arbNonEmptyString(), // user name
        arbHourOfDay(), // hour of day
        (userName, hour) => {
          const greeting = generateGreeting(userName, hour);
          expect(greeting).toContain(userName);
        }
      )
    );
  });

  it("should use appropriate time-based greeting", () => {
    runPropertyTest(
      fc.property(arbNonEmptyString(), arbHourOfDay(), (userName, hour) => {
        const greeting = generateGreeting(userName, hour);

        if (hour >= 5 && hour < 12) {
          expect(greeting).toContain("morning");
        } else if (hour >= 12 && hour < 18) {
          expect(greeting).toContain("afternoon");
        } else {
          expect(greeting).toContain("evening");
        }
      })
    );
  });
});
```

## React Query Testing

When testing components that use React Query, wrap them with `QueryProvider`:

```typescript
import { render } from "@testing-library/react";
import { QueryProvider } from "@/components/providers/QueryProvider";

function renderWithQuery(component: React.ReactElement) {
  return render(<QueryProvider>{component}</QueryProvider>);
}
```

## Additional Resources

- [Fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
- [React Query Testing Guide](https://tanstack.com/query/latest/docs/react/guides/testing)
