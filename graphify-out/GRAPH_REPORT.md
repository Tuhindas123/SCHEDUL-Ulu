# Graph Report - Smart Scheduler  (2026-09-19)

## Corpus Check
- 151 files · ~141,220 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 928 nodes · 1677 edges · 75 communities (50 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfad04f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Home.jsx
- dependencies
- Assignments.jsx
- package.json
- supabaseData.js
- cn
- sidebar.jsx
- schedule-dashboard/package.json
- utils.js
- alert-dialog.jsx
- devDependencies
- TimetableUpload.jsx
- components.json
- menubar.jsx
- compilerOptions
- RoleDashboard.jsx
- sheetsClient.js
- AppShell.jsx
- image.jsx
- manifest.json
- src/App.jsx
- react-router-dom
- command.jsx
- form.jsx
- admin.jsx
- Migrating Schedul-Ulu from Google Sheets → Supabase
- chart.jsx
- Medicines.jsx
- ExampleInstrumentedTest.java
- carousel.jsx
- sheet.jsx
- navigation-menu.jsx
- breadcrumb.jsx
- toggle-group.jsx
- drawer.jsx
- PreviewRoleContext.jsx
- schedule-dashboard/src/App.jsx
- scripts
- Feedback.jsx
- AGENTS.md
- eslint.config.js
- input-otp.jsx
- .oxlintrc.json
- avatar.jsx
- tabs.jsx
- alert.jsx
- gradlew
- upload_timetable
- sonner.jsx
- scroll-area.jsx
- React + Vite
- MainActivity.java
- capacitor.config.ts
- Schedul-Ulu
- @tanstack/react-query
- CLAUDE.md
- @radix-ui/react-aspect-ratio
- @radix-ui/react-collapsible
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `cn()` - 228 edges
2. `api` - 19 edges
3. `AppShell()` - 18 edges
4. `compilerOptions` - 14 edges
5. `react-router-dom` - 14 edges
6. `toast()` - 14 edges
7. `usePreviewRole()` - 14 edges
8. `useToast()` - 13 edges
9. `getSession()` - 11 edges
10. `class-variance-authority` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `AlertDialogContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js
- `AlertDialogTitle` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.jsx → src/lib/utils.js

## Import Cycles
- None detected.

## Communities (75 total, 9 thin omitted)

### Community 0 - "Home.jsx"
Cohesion: 0.06
Nodes (56): api, LogEntryForm(), STATUS_OPTIONS, STATUS_OPTIONS, TeacherRollCall(), AttendanceRing(), CTA, MESSAGES (+48 more)

### Community 1 - "dependencies"
Cohesion: 0.03
Nodes (76): dependencies, @base44/sdk, @base44/vite-plugin, canvas-confetti, @capacitor/android, @capacitor/app, @capacitor/browser, @capacitor/cli (+68 more)

### Community 2 - "Assignments.jsx"
Cohesion: 0.06
Nodes (59): class-variance-authority, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle (+51 more)

### Community 3 - "package.json"
Cohesion: 0.04
Nodes (46): autoprefixer, lucide-react, postcss, react, react-dom, tailwindcss, @types/react, @types/react-dom (+38 more)

### Community 4 - "supabaseData.js"
Cohesion: 0.06
Nodes (22): @capacitor/core, @capacitor/filesystem, @capacitor/share, @supabase/supabase-js, xlsx, arrayBufferToBase64(), buildWorkbook(), ExportButton() (+14 more)

### Community 5 - "cn"
Cohesion: 0.10
Nodes (33): @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-select, AccordionContent, AccordionItem, AccordionTrigger, ContextMenuCheckboxItem (+25 more)

### Community 6 - "sidebar.jsx"
Cohesion: 0.07
Nodes (30): Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent (+22 more)

### Community 7 - "schedule-dashboard/package.json"
Cohesion: 0.06
Nodes (33): oxlint, dependencies, lucide-react, react, react-dom, devDependencies, autoprefixer, oxlint (+25 more)

### Community 8 - "utils.js"
Cohesion: 0.06
Nodes (23): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, @radix-ui/react-switch (+15 more)

### Community 9 - "alert-dialog.jsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-alert-dialog, react-day-picker, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+11 more)

### Community 10 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, baseline-browser-mapping, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+11 more)

### Community 11 - "TimetableUpload.jsx"
Cohesion: 0.20
Nodes (17): buildTimeSlots(), COLOR_KEYS, DAY_ALIASES, FILLER_LABELS, findClassColumn(), findColumn(), importFlatRows(), importGridRows() (+9 more)

### Community 12 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 13 - "menubar.jsx"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator (+4 more)

### Community 14 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowSyntheticDefaultImports, baseUrl, checkJs, esModuleInterop, jsx, lib, module (+8 more)

### Community 15 - "RoleDashboard.jsx"
Cohesion: 0.26
Nodes (11): @capacitor/browser, DateTimeCard(), StatCard(), ProtectedRoute(), useTheme(), getSession(), getStoredUser(), onAuthStateChange() (+3 more)

### Community 16 - "sheetsClient.js"
Cohesion: 0.26
Nodes (15): authedFetch(), COLORS, createRow(), createSheet(), deleteRow(), ensureSheet(), ENTITIES, findExistingSheet() (+7 more)

### Community 17 - "AppShell.jsx"
Cohesion: 0.26
Nodes (8): AppShell(), navGroups(), THEMES, LABEL, PreviewRoleBanner(), PreviewRoleSwitcher(), usePreviewRole(), About()

### Community 18 - "image.jsx"
Cohesion: 0.26
Nodes (11): buildSrcSet(), buildTransformUrl(), clamp01(), clampDim(), DEVICE_PIXEL_RATIOS, Image, ImageWrapper, parseWixMediaUrl() (+3 more)

### Community 19 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 20 - "src/App.jsx"
Cohesion: 0.26
Nodes (6): @capacitor/app, LoadingScreen(), styles, signInWithGoogle(), Login(), RoleHome()

### Community 21 - "react-router-dom"
Cohesion: 0.18
Nodes (3): react-router-dom, getHashId(), ScrollToTop()

### Community 22 - "command.jsx"
Cohesion: 0.18
Nodes (9): cmdk, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 23 - "form.jsx"
Cohesion: 0.25
Nodes (9): react-hook-form, FormControl, FormDescription, FormFieldContext, FormItem, FormItemContext, FormLabel, FormMessage (+1 more)

### Community 24 - "admin.jsx"
Cohesion: 0.22
Nodes (6): classifyEmail(), RULES, Admin(), PeopleTab(), ROLE_CHIP, SUBTABS

### Community 25 - "Migrating Schedul-Ulu from Google Sheets → Supabase"
Cohesion: 0.18
Nodes (10): 1. Create the Supabase project, 2. Create the tables, 3. Enable Google sign-in, 4. Install the dependency, 5. Drop in the files, 6. Web ↔ App sync, in practice, 7. One caveat for the Android app, 8. Exporting to Excel (optional) (+2 more)

### Community 26 - "chart.jsx"
Cohesion: 0.29
Nodes (8): recharts, ChartContainer, ChartContext, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES, useChart()

### Community 27 - "Medicines.jsx"
Cohesion: 0.42
Nodes (7): MedicineDetailModal(), formatTime12(), getMedStatus(), MEDICINES, timeToMin(), FILTERS, Medicines()

### Community 28 - "ExampleInstrumentedTest.java"
Cohesion: 0.33
Nodes (5): ExampleInstrumentedTest, ExampleUnitTest, androidx.test.ext.junit.runners.AndroidJUnit4, org.junit.runner.RunWith, org.junit.Test

### Community 29 - "carousel.jsx"
Cohesion: 0.33
Nodes (8): embla-carousel-react, Carousel, CarouselContent, CarouselContext, CarouselItem, CarouselNext, CarouselPrevious, useCarousel()

### Community 30 - "sheet.jsx"
Cohesion: 0.25
Nodes (8): @radix-ui/react-dialog, SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 31 - "navigation-menu.jsx"
Cohesion: 0.25
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 32 - "breadcrumb.jsx"
Cohesion: 0.22
Nodes (8): @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 33 - "toggle-group.jsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 34 - "drawer.jsx"
Cohesion: 0.22
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 35 - "PreviewRoleContext.jsx"
Cohesion: 0.28
Nodes (6): App(), PreviewRoleContext, PreviewRoleProvider(), ROLES, ThemeContext, ThemeProvider()

### Community 36 - "schedule-dashboard/src/App.jsx"
Cohesion: 0.32
Nodes (6): App(), DAYS, DEFAULT_SCHEDULES, HOURS, SUBJECT_THEMES, timeToMinutes()

### Community 37 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, lint:fix, preview, typecheck

### Community 38 - "Feedback.jsx"
Cohesion: 0.38
Nodes (4): FEEDBACK_ENDPOINT, Feedback(), fileToBase64(), RATING_LABELS

### Community 39 - "AGENTS.md"
Cohesion: 0.33
Nodes (4): Base44 References, Key Files, Project Context, Working Notes

### Community 40 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-unused-imports, globals

### Community 41 - "input-otp.jsx"
Cohesion: 0.33
Nodes (5): input-otp, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 42 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 43 - "avatar.jsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-avatar, Avatar, AvatarFallback, AvatarImage

### Community 44 - "tabs.jsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-tabs, TabsContent, TabsList, TabsTrigger

### Community 45 - "alert.jsx"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 46 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 47 - "upload_timetable"
Cohesion: 0.50
Nodes (3): upload_timetable(), post, UploadFile

### Community 49 - "scroll-area.jsx"
Cohesion: 0.50
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 50 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **294 isolated node(s):** `config`, `$schema`, `style`, `rsc`, `tsx` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 374 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `Assignments.jsx`, `sidebar.jsx`, `utils.js`, `alert-dialog.jsx`, `menubar.jsx`, `image.jsx`, `command.jsx`, `form.jsx`, `chart.jsx`, `carousel.jsx`, `sheet.jsx`, `navigation-menu.jsx`, `breadcrumb.jsx`, `toggle-group.jsx`, `drawer.jsx`, `input-otp.jsx`, `avatar.jsx`, `tabs.jsx`, `alert.jsx`, `scroll-area.jsx`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `react-router-dom` connect `react-router-dom` to `Home.jsx`, `package.json`, `Feedback.jsx`, `RoleDashboard.jsx`, `AppShell.jsx`, `src/App.jsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `config`, `$schema`, `style` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057124310288867254 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.02631578947368421 - nodes in this community are weakly interconnected._
- **Should `Assignments.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.062342342342342344 - nodes in this community are weakly interconnected._