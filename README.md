# SellPoint — Complete Design System

## 1. DARK MODE

```text
// =========================================
// === DARK MODE ===
// =========================================

Background              : bg-zinc-950
Background Secondary    : bg-zinc-900
Background Elevated     : bg-zinc-800
Background Hover        : hover:bg-zinc-800
Background Active       : active:bg-zinc-700

Cards                   : bg-zinc-900 text-zinc-100
Elevated Cards          : bg-zinc-900 text-zinc-100
Interactive Cards       : hover:bg-zinc-800 hover:border-zinc-600
Selected Cards          : bg-zinc-800 border-zinc-500
Disabled Cards          : bg-zinc-900/50 text-zinc-500

Primary Text            : text-zinc-100
Secondary Text          : text-zinc-300
Muted Text              : text-zinc-400
Subtle Text             : text-zinc-500
Inverse Text            : text-zinc-950

Border                  : border border-zinc-800
Border Strong           : border-zinc-700
Border Hover            : hover:border-zinc-600
Border Active           : border-zinc-500
Divider                 : bg-zinc-800

Primary Button           : bg-zinc-50 text-zinc-950
Primary Button Hover     : hover:bg-white
Primary Button Active    : active:bg-zinc-200
Secondary Button         : bg-zinc-800 text-zinc-100
Secondary Button Hover   : hover:bg-zinc-700
Outline Button           : border border-zinc-700 text-zinc-100
Outline Button Hover     : hover:bg-zinc-800
Ghost Button             : text-zinc-300 hover:bg-zinc-800
Danger Button            : bg-red-500 text-white hover:bg-red-600
Success Button           : bg-emerald-600 text-white hover:bg-emerald-500

Inputs                   : bg-zinc-900 text-zinc-100
Input Border             : border-zinc-700
Input Hover              : hover:border-zinc-600
Input Focus              : focus:border-zinc-400
Input Placeholder        : placeholder:text-zinc-500
Input Disabled           : disabled:bg-zinc-900 disabled:text-zinc-500

Select                   : bg-zinc-900 text-zinc-100
Checkbox                 : accent-zinc-100
Radio                    : accent-zinc-100
Switch Track             : bg-zinc-700
Switch Track Active      : bg-zinc-100
Switch Thumb             : bg-zinc-950

Links                    : text-zinc-200
Links Hover              : hover:text-white hover:underline
Icons                    : text-zinc-300
Icons Hover              : hover:text-white

Focus Ring               : focus-visible:ring-2 focus-visible:ring-zinc-400
Focus Offset             : focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950

Shadow                   : shadow-lg shadow-black/20
Dropdown Shadow          : shadow-xl shadow-black/30
Overlay                  : bg-black/60
Skeleton                 : animate-pulse bg-zinc-800
Scrollbar Track          : bg-zinc-950
Scrollbar Thumb          : bg-zinc-700
Scrollbar Thumb Hover    : hover:bg-zinc-600
```

## 2. LIGHT MODE

```text
// =========================================
// === LIGHT MODE ===
// =========================================

Background              : bg-white
Background Secondary    : bg-zinc-50
Background Elevated     : bg-white
Background Hover        : hover:bg-zinc-100
Background Active       : active:bg-zinc-200

Cards                   : bg-white text-zinc-900
Elevated Cards          : bg-white text-zinc-900
Interactive Cards       : hover:bg-zinc-50 hover:border-zinc-300
Selected Cards          : bg-zinc-100 border-zinc-400
Disabled Cards          : bg-zinc-50 text-zinc-400

Primary Text            : text-zinc-900
Secondary Text          : text-zinc-700
Muted Text              : text-zinc-500
Subtle Text             : text-zinc-400
Inverse Text            : text-white

Border                  : border border-zinc-200
Border Strong           : border-zinc-300
Border Hover            : hover:border-zinc-400
Border Active           : border-zinc-500
Divider                 : bg-zinc-100

Primary Button           : bg-zinc-900 text-white
Primary Button Hover     : hover:bg-zinc-800
Primary Button Active    : active:bg-zinc-700
Secondary Button         : bg-zinc-100 text-zinc-900
Secondary Button Hover   : hover:bg-zinc-200
Outline Button           : border border-zinc-300 text-zinc-900
Outline Button Hover     : hover:bg-zinc-50
Ghost Button             : text-zinc-600 hover:bg-zinc-100
Danger Button            : bg-red-600 text-white hover:bg-red-700
Success Button           : bg-emerald-600 text-white hover:bg-emerald-700

Inputs                   : bg-white text-zinc-900
Input Border             : border-zinc-300
Input Hover              : hover:border-zinc-400
Input Focus              : focus:border-zinc-500
Input Placeholder        : placeholder:text-zinc-400
Input Disabled           : disabled:bg-zinc-100 disabled:text-zinc-400

Select                   : bg-white text-zinc-900
Checkbox                 : accent-zinc-900
Radio                    : accent-zinc-900
Switch Track             : bg-zinc-300
Switch Track Active      : bg-zinc-900
Switch Thumb             : bg-white

Links                    : text-zinc-800
Links Hover              : hover:text-black hover:underline
Icons                    : text-zinc-600
Icons Hover              : hover:text-zinc-950

Focus Ring               : focus-visible:ring-2 focus-visible:ring-zinc-500
Focus Offset             : focus-visible:ring-offset-2 focus-visible:ring-offset-white

Shadow                   : shadow-sm shadow-zinc-900/5
Dropdown Shadow          : shadow-xl shadow-zinc-900/10
Overlay                  : bg-black/40
Skeleton                 : animate-pulse bg-zinc-200
Scrollbar Track          : bg-zinc-50
Scrollbar Thumb          : bg-zinc-300
Scrollbar Thumb Hover    : hover:bg-zinc-400
```

## 3. SHARED DESIGN TOKENS

```text
// =========================================
// === SHARED DESIGN SYSTEM ===
// =========================================

Font Family              : font-sans
Font Weight Normal       : font-normal
Font Weight Medium       : font-medium
Font Weight Semibold     : font-semibold
Font Weight Bold         : font-bold

Page Padding             : px-4 sm:px-6 lg:px-8
Page Max Width           : max-w-7xl mx-auto
Section Spacing          : space-y-8
Section Inner Spacing    : space-y-4
Grid Gap                 : gap-4 sm:gap-6
Inline Gap               : gap-2
Large Gap                : gap-8

Card Radius              : rounded-2xl
Input Radius             : rounded-xl
Button Radius            : rounded-xl
Badge Radius             : rounded-full
Modal Radius             : rounded-2xl
Dropdown Radius          : rounded-xl
Image Radius             : rounded-xl
Small Radius             : rounded-lg

Card Padding             : p-5 sm:p-6
Compact Card Padding     : p-4
Section Padding          : py-8 sm:py-12
Input Padding            : px-4 py-3
Button Padding           : px-5 py-3
Small Button Padding     : px-3 py-2

Page Heading             : text-2xl sm:text-3xl font-bold tracking-tight
Section Heading          : text-xl font-semibold tracking-tight
Card Heading             : text-base font-semibold
Body Text                : text-sm sm:text-base leading-7
Caption                  : text-xs text-zinc-500
Label                    : text-sm font-medium
Price                    : text-lg font-bold tabular-nums
Metadata                 : text-xs text-zinc-500

Transition Colors        : transition-colors duration-200
Transition All           : transition-all duration-200 ease-out
Transition Transform     : transition-transform duration-200 ease-out
Focus                    : outline-none focus-visible:ring-2
Disabled                 : disabled:opacity-50 disabled:cursor-not-allowed
Reduced Motion           : motion-reduce:transition-none motion-reduce:animate-none

Z-Index Dropdown         : z-30
Z-Index Sticky           : z-40
Z-Index Overlay          : z-50
Z-Index Modal            : z-[60]
Z-Index Toast            : z-[70]
```

## 4. BUTTONS

```text
Primary Button:
inline-flex items-center justify-center gap-2
rounded-xl px-5 py-3 font-medium
bg-zinc-900 text-white
hover:bg-zinc-800
active:scale-[0.98]
transition-all duration-200
focus-visible:ring-2 focus-visible:ring-zinc-500
disabled:opacity-50 disabled:cursor-not-allowed

Secondary Button:
inline-flex items-center justify-center gap-2
rounded-xl px-5 py-3 font-medium
bg-zinc-100 text-zinc-900
hover:bg-zinc-200
active:scale-[0.98]
transition-all duration-200

Outline Button:
inline-flex items-center justify-center gap-2
rounded-xl border border-zinc-200
px-5 py-3 font-medium
hover:bg-zinc-50
active:scale-[0.98]
transition-all duration-200

Ghost Button:
inline-flex items-center justify-center gap-2
rounded-xl px-4 py-2
hover:bg-zinc-100
transition-colors duration-200

Icon Button:
inline-flex items-center justify-center
size-10 rounded-xl
hover:bg-zinc-100
active:scale-95
transition-all duration-200

Danger Button:
rounded-xl px-5 py-3
bg-red-600 text-white
hover:bg-red-700
active:scale-[0.98]

Small Button:
rounded-lg px-3 py-2 text-sm font-medium

Full Width Button:
w-full
```

## 5. FORMS AND INPUTS

```text
Form Group             : space-y-2
Form Label             : block text-sm font-medium
Input                  : w-full rounded-xl border
                         bg-white px-4 py-3 text-sm
                         placeholder:text-zinc-400
                         transition-colors duration-200
                         focus-visible:outline-none
                         focus-visible:ring-2
                         focus-visible:ring-zinc-500
                         disabled:opacity-50
Textarea               : min-h-32 resize-y
Select                 : w-full appearance-none rounded-xl
                         border bg-white px-4 py-3
Checkbox              : size-4 rounded accent-zinc-900
Radio                  : size-4 accent-zinc-900
Switch                 : relative inline-flex h-6 w-11
                         rounded-full transition-colors
Error Text             : text-sm text-red-600
Success Text           : text-sm text-emerald-600
Helper Text            : text-xs text-zinc-500
Required Indicator     : text-red-500
Field Error Border     : border-red-500
Field Success Border   : border-emerald-500
```

## 6. CARDS AND LISTS

```text
Default Card:
rounded-2xl border border-zinc-200
bg-white p-5 shadow-sm

Interactive Card:
rounded-2xl border border-zinc-200
bg-white p-5
transition-all duration-200
hover:border-zinc-300
hover:shadow-md

Product Card:
overflow-hidden rounded-2xl
border border-zinc-200 bg-white
transition-all duration-200
hover:-translate-y-0.5 hover:shadow-lg

Product Image:
aspect-square w-full object-cover
bg-zinc-100

Product Title:
line-clamp-2 text-sm font-medium leading-6

Product Price:
text-lg font-bold tracking-tight
tabular-nums

Product Metadata:
text-xs text-zinc-500

List Item:
flex items-center gap-3
rounded-xl px-4 py-3
transition-colors duration-200
hover:bg-zinc-50

Selected List Item:
bg-zinc-100 text-zinc-950
```

## 7. BADGES AND STATUS

```text
Default Badge:
inline-flex items-center gap-1
rounded-full px-2.5 py-1
text-xs font-medium

Neutral:
bg-zinc-100 text-zinc-700

Success:
bg-emerald-50 text-emerald-700

Warning:
bg-amber-50 text-amber-700

Error:
bg-red-50 text-red-700

Information:
bg-blue-50 text-blue-700

Pending:
bg-amber-50 text-amber-700

Active:
bg-emerald-50 text-emerald-700

Inactive:
bg-zinc-100 text-zinc-500

Online Indicator:
size-2 rounded-full bg-emerald-500

Required:
text-red-500
```

## 8. MODALS, DROPDOWNS AND POPOVERS

```text
Overlay:
fixed inset-0 z-50
bg-black/40 backdrop-blur-sm

Modal:
relative w-full max-w-lg
rounded-2xl border border-zinc-200
bg-white p-6 shadow-2xl

Modal Header:
flex items-center justify-between gap-4

Modal Title:
text-lg font-semibold tracking-tight

Modal Body:
mt-4 space-y-4

Modal Footer:
mt-6 flex flex-col-reverse gap-3
sm:flex-row sm:justify-end

Dropdown:
z-30 overflow-hidden rounded-xl
border border-zinc-200 bg-white
py-1 shadow-xl

Dropdown Item:
flex w-full items-center gap-3
px-4 py-2.5 text-sm
transition-colors hover:bg-zinc-50

Popover:
rounded-xl border border-zinc-200
bg-white p-4 shadow-xl
```

## 9. TOASTS AND NOTIFICATIONS

```text
Toast Container:
fixed right-4 top-4 z-[70]
flex flex-col gap-3

Toast:
flex items-start gap-3
rounded-xl border bg-white
p-4 shadow-lg

Toast Success:
border-emerald-200

Toast Error:
border-red-200

Toast Warning:
border-amber-200

Toast Info:
border-blue-200

Notification Unread:
bg-zinc-50 border-l-2 border-l-zinc-900

Notification Read:
bg-white

Notification Dot:
size-2 rounded-full bg-blue-500
```

## 10. TABLES AND PAGINATION

```text
Table Wrapper:
w-full overflow-x-auto
rounded-2xl border border-zinc-200

Table:
w-full border-collapse text-sm

Table Header:
bg-zinc-50 text-zinc-600
text-left font-medium

Table Header Cell:
px-4 py-3

Table Body Row:
border-t border-zinc-100
transition-colors hover:bg-zinc-50

Table Cell:
px-4 py-3 align-middle

Pagination Button:
flex size-9 items-center justify-center
rounded-lg border border-zinc-200
hover:bg-zinc-100

Pagination Active:
bg-zinc-900 text-white
border-zinc-900
```

## 11. LOADING, EMPTY AND ERROR STATES

```text
Skeleton:
animate-pulse rounded-lg bg-zinc-200

Skeleton Text:
h-4 rounded-md bg-zinc-200

Skeleton Avatar:
size-10 rounded-full bg-zinc-200

Skeleton Product:
aspect-square rounded-xl bg-zinc-200

Empty State:
flex flex-col items-center
justify-center gap-3
py-16 text-center

Empty State Icon:
size-12 text-zinc-400

Empty State Title:
text-lg font-semibold

Empty State Description:
max-w-sm text-sm leading-6 text-zinc-500

Error State:
rounded-xl border border-red-200
bg-red-50 p-4 text-red-700

Retry Button:
text-sm font-medium underline underline-offset-4

Loading Spinner:
size-5 animate-spin rounded-full
border-2 border-current border-t-transparent
```

## 12. HEADER, SIDEBAR AND NAVIGATION

```text
Header:
sticky top-0 z-40 w-full
border-b border-zinc-200
bg-white/90 backdrop-blur-xl

Header Inner:
mx-auto flex h-16 max-w-7xl
items-center justify-between px-4 sm:px-6

Navigation Link:
rounded-lg px-3 py-2
text-sm font-medium text-zinc-600
transition-colors hover:bg-zinc-100
hover:text-zinc-950

Navigation Active:
bg-zinc-100 text-zinc-950

Sidebar:
border-r border-zinc-200
bg-white

Sidebar Item:
flex items-center gap-3
rounded-xl px-3 py-2.5
text-sm transition-colors

Sidebar Active:
bg-zinc-100 text-zinc-950 font-medium

Mobile Navigation:
fixed inset-x-0 bottom-0 z-40
border-t border-zinc-200
bg-white/95 backdrop-blur-xl
pb-[env(safe-area-inset-bottom)]
```

## 13. PRODUCT AND MARKETPLACE COMPONENTS

```text
Product Grid:
grid grid-cols-2 gap-3
sm:grid-cols-3 sm:gap-5
lg:grid-cols-4 xl:grid-cols-5

Product Image Container:
relative aspect-square overflow-hidden
rounded-xl bg-zinc-100

Product Image Hover:
transition-transform duration-300
group-hover:scale-[1.03]

Favorite Button:
absolute right-3 top-3
flex size-9 items-center justify-center
rounded-full bg-white/90 shadow-sm
backdrop-blur-sm transition-transform
hover:scale-105 active:scale-95

Product Price:
text-lg font-bold tabular-nums

Store Card:
overflow-hidden rounded-2xl
border border-zinc-200 bg-white
transition-all duration-200 hover:shadow-md

Store Avatar:
size-12 rounded-full
border border-zinc-200 object-cover

Search Container:
flex w-full items-center gap-3
rounded-2xl border border-zinc-200
bg-zinc-50 px-4 py-3
focus-within:border-zinc-400
focus-within:ring-2 focus-within:ring-zinc-200

Filter Chip:
rounded-full border border-zinc-200
px-3 py-2 text-sm
transition-colors hover:bg-zinc-100

Filter Chip Active:
border-zinc-900 bg-zinc-900 text-white

Ad Image Gallery:
grid grid-cols-2 gap-2
overflow-hidden rounded-2xl

Seller Information:
flex items-center gap-3
rounded-2xl border border-zinc-200 p-4

Price Highlight:
rounded-xl bg-zinc-50 p-4
```

## 14. RESPONSIVE DESIGN

```text
Mobile First:
Use base styles for mobile,
sm: for small screens,
md: for tablets,
lg: for desktops,
xl: for wide screens.

Container:
mx-auto w-full max-w-7xl px-4
sm:px-6 lg:px-8

Responsive Grid:
grid grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4

Responsive Heading:
text-2xl sm:text-3xl lg:text-4xl

Responsive Section:
py-8 sm:py-12 lg:py-16

Responsive Dialog:
w-[calc(100%-2rem)]
sm:max-w-lg

Responsive Actions:
flex flex-col gap-3
sm:flex-row sm:justify-end

Responsive Overflow:
min-w-0 break-words
overflow-x-auto where required
```

## 15. ANIMATIONS AND MICRO-INTERACTIONS

```text
Default Transition:
transition-colors duration-200 ease-out

Interactive Transition:
transition-all duration-200 ease-out

Button Press:
active:scale-[0.98]

Icon Button Press:
active:scale-95

Card Hover:
hover:-translate-y-0.5
hover:shadow-md

Image Hover:
transition-transform duration-300

Dropdown:
animate-in fade-in-0 zoom-in-95 duration-150

Modal:
animate-in fade-in-0 zoom-in-95 duration-200

Tooltip:
transition-opacity duration-150

Respect Reduced Motion:
motion-reduce:transform-none
motion-reduce:transition-none
motion-reduce:animate-none
```

## 16. ACCESSIBILITY AND FINAL RULES

```text
Focus:
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-zinc-500
focus-visible:ring-offset-2

Disabled:
disabled:cursor-not-allowed
disabled:opacity-50

Keyboard Navigation:
All interactive elements must be keyboard accessible.

Contrast:
Maintain readable text contrast in both themes.

Forms:
Every input must have an associated label.
Display validation errors near the relevant field.

Dialogs:
Support Escape where appropriate,
manage focus, and prevent background interaction.

Images:
Provide meaningful alt text.
Use object-cover or object-contain as appropriate.

Buttons:
Use semantic button elements.
Do not use clickable divs for actions.

Links:
Use links for navigation and buttons for actions.

Theme:
Every component must support both dark and light modes.

Consistency:
Use shared tokens instead of repeating arbitrary values.
Avoid excessive shadows, gradients, blur, and animation.
```

# END OF DESIGN SYSTEM