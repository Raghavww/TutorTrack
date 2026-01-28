# ZHK Tuition Ltd Management System - Design Guidelines

## Design Approach

**Selected Approach:** Design System-Based (Modern SaaS Dashboard)
**Primary References:** Linear's data organization + Notion's table aesthetics + Stripe Dashboard's professional restraint
**Rationale:** Information-dense business tool requiring clarity, efficiency, and professional credibility.

---

## Typography System

**Font Stack:**
- **Primary:** Inter (via Google Fonts) - for UI elements, tables, cards
- **Display/Headers:** Cal Sans or Clash Display - for marketing/landing sections

**Hierarchy:**
- Page Titles: 2xl-3xl, semibold (600)
- Section Headers: xl-2xl, semibold (600)
- Card Titles: lg, medium (500)
- Body/Table Text: base, regular (400)
- Labels/Meta: sm, medium (500)
- Captions: xs, regular (400)

---

## Layout & Spacing System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component internal padding: p-4 to p-6
- Card spacing: p-6
- Section padding: py-12 to py-16
- Dashboard sidebar width: w-64
- Content max-width: max-w-7xl

**Grid System:**
- Dashboard: 12-column grid
- Cards: 2-3 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Tables: Full-width within container

---

## Component Library

### Navigation
**Dashboard Sidebar:**
- Fixed left sidebar (w-64)
- Vertical navigation with icons + labels
- Active state: subtle background treatment
- Logo at top, user profile at bottom
- Collapsible on mobile (hamburger)

**Top Bar:**
- Breadcrumb navigation
- Search functionality (prominent)
- User menu dropdown (right-aligned)
- Notification bell icon

### Data Display

**Tables:**
- Striped rows for scannability
- Sticky header on scroll
- Row hover states
- Action buttons (icon-only) right-aligned
- Sortable column headers with chevron indicators
- Pagination controls (bottom-right)
- Empty states with clear messaging
- Responsive: stack on mobile with card-like display

**Cards:**
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm)
- Padding: p-6
- Header with title + action button/icon
- Divider between header and content
- Stat cards: Large number + label + trend indicator

**Status Badges:**
- Pill-shaped (rounded-full)
- Small size: px-3 py-1, text-xs
- Semantic states: Active, Pending, Completed, Cancelled

### Forms
- Labels: text-sm, medium (500), mb-2
- Input fields: px-4 py-2.5, rounded-md, border
- Focus states: ring treatment
- Error messages: text-sm, below input
- Required indicators: asterisk (*)
- Field grouping with mb-6 spacing
- Submit buttons: Primary style, full or auto width

### Buttons
**Primary:** Solid background, semibold text, px-6 py-2.5, rounded-md
**Secondary:** Border treatment, semibold text, same padding
**Ghost:** No background/border on default, hover reveals
**Icon Buttons:** Square/circular, p-2
**Blurred Hero Buttons:** backdrop-blur-sm with semi-transparent background

### Modals & Overlays
- Centered overlay with backdrop
- Max-width: max-w-2xl
- Padding: p-8
- Header with title + close button
- Footer with action buttons (right-aligned)
- Smooth entry/exit transitions

---

## Page Layouts

### Landing/Marketing Page
**Hero Section (80vh):**
- Large background image (tutoring environment: students with tutor, bright classroom)
- Centered content with max-w-4xl
- Headline: 4xl-5xl, bold
- Subheadline: xl
- CTA buttons: Primary + Secondary, backdrop-blur treatment
- Trust indicator: "Managing 500+ students across 50 tutors"

**Features Grid:** 3 columns, icon + title + description cards
**Benefits Section:** 2-column split (image left, content right)
**Testimonials:** 2-column card layout with photos
**Pricing/Demo CTA:** Centered, bold section
**Footer:** 3-column (Company, Product, Support) + Newsletter signup

### Dashboard Layout (Admin & Tutor)
**Structure:**
- Fixed sidebar (left)
- Main content area with top bar
- Content padding: p-8

**Admin Dashboard:**
- Stats overview: 4-column stat cards
- Recent activity table
- Quick actions card
- Student/Tutor summary widgets

**Tutor Dashboard:**
- Personal stats: 3-column cards
- Timesheet management (prominent table)
- Upcoming sessions calendar view
- Student list with quick actions

### Student Management Page
- Page header with title + "Add Student" button
- Filter/search bar
- Student table: Name, Contact, Status, Sessions, Tutor, Actions
- Pagination controls

### Timesheet Tracking
- Calendar view toggle (week/month)
- Time entry form (inline or modal)
- Approval workflow indicators
- Export functionality (top-right)

### Billing Section
- Dual-rate display (clear differentiation)
- Invoice generation interface
- Payment status tracking table
- Financial summary cards

---

## Images

**Hero Image:** Full-width background image showing professional tutoring environment - bright, modern classroom with tutor helping students, natural lighting, professional photography style. Position: Behind hero content with subtle gradient overlay for text contrast.

**Benefits Section:** Supporting image showing dashboard interface mockup or happy students/tutors interaction (right side of 2-column layout).

**Testimonial Photos:** Square headshots (64x64px) for testimonial cards.

---

## Accessibility

- All interactive elements keyboard navigable
- Focus indicators: 2px ring offset
- ARIA labels for icon-only buttons
- Table headers properly scoped
- Form labels explicitly associated with inputs
- Minimum touch target: 44x44px
- Consistent tab order throughout

---

## Animations

**Minimal & Purposeful:**
- Page transitions: Subtle fade (150ms)
- Modal entry: Scale + fade (200ms)
- Button states: Instant feedback
- Table row hover: Smooth background transition (150ms)
- No scroll-triggered animations
- Dropdown menus: Slide down (150ms)