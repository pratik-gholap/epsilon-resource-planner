# Timeline View Quick Start Guide 🗓️

## What You'll See

The timeline view displays:
- **First Column**: All team members (name and role)
- **Next 6 Columns**: Months starting from January 2026 (Jan 2026, Feb 2026, Mar 2026, etc.)
- **Last Column**: Action buttons (delete person)

Each cell shows:
- Assignment cards (color-coded by client)
- Percentage allocation
- Heat map background (green = low, yellow = medium, red = high)

---

## 🚀 Quick Start

### Step 1: Make Sure Servers Are Running

**Terminal 1 - Backend:**
```bash
cd C:\Users\aa\Documents\GitHub\erp-react\outputs\backend
python backend.py
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\aa\Documents\GitHub\erp-react\outputs\frontend
npm run dev
```

### Step 2: Open the App

Open browser to: **http://localhost:3000**

You should see:
- Header with Epsilon logo and action buttons
- Sidebar on the left (empty initially)
- Timeline view in the center with headers: **Team Member | Jan 2026 | Feb 2026 | Mar 2026 | Apr 2026 | May 2026 | Jun 2026 | Actions**

---

## 📊 Add Sample Data (Fastest Way)

### Option A: Use the Sample Data Script

1. Open browser console (Press F12 → Console tab)
2. Copy and paste the entire contents of `add-sample-data.js`
3. Press Enter
4. Wait for "✅ Sample data added successfully!"
5. Refresh the page (F5)

**You'll see:**
- 8 team members
- 3 clients
- 5 projects
- 12 assignments across January-July 2026

### Option B: Add Data Manually

**Add a Client:**
1. Click 🏢 icon in header
2. Name: "Acme Corp"
3. Click "Add"

**Add a Project:**
1. Click 📊 icon
2. Name: "Website Redesign"
3. Client: "Acme Corp"
4. Click "Add"

**Add a Person:**
1. Click 👤 icon
2. Name: "Sarah Johnson"
3. Role: "Developer"
4. Click "Add"

**Create an Assignment:**
1. Click 📅 icon
2. Person: "Sarah Johnson"
3. Project: "Website Redesign"
4. Start Date: 2026-01-15
5. End Date: 2026-03-31
6. Allocation: 80%
7. Click "Add Assignment"

**View the Result:**
- Sarah Johnson appears in the first column
- An assignment card appears in Jan, Feb, and Mar 2026 cells
- Card is color-coded by client
- Hover over card to see details

---

## 🎨 What the Timeline Shows

### Column Layout
```
┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬─────────┐
│ Team Member  │ Jan 2026 │ Feb 2026 │ Mar 2026 │ Apr 2026 │ May 2026 │ Jun 2026 │ Actions │
├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼─────────┤
│ Sarah        │  [Card]  │  [Card]  │  [Card]  │    —     │    —     │    —     │   [×]   │
│ Developer    │   80%    │   80%    │   80%    │          │          │          │         │
├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼─────────┤
│ Mike         │  [Card]  │  [Card]  │  [Card]  │    —     │    —     │    —     │   [×]   │
│ Developer    │   50%    │   90%    │   90%    │          │          │          │         │
└──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘
```

### Heat Map Colors
- **Green (0-30%)**: Low allocation - person has availability
- **Yellow (31-70%)**: Medium allocation - moderate workload
- **Red (71-100%+)**: High allocation - person is busy or over-allocated

### Assignment Cards
- **Color**: Determined by client (consistent across all projects for that client)
- **Opacity**: Based on allocation % (higher % = more opaque)
- **Badge**: Shows allocation percentage
- **Hover**: Shows full details (project, client, dates, duration)
- **Delete**: × button appears on hover

---

## 🔄 Navigation

### Timeline Navigation
- **← Previous**: Go back 6 months
- **Next →**: Go forward 6 months
- **📅 (Calendar icon)**: Jump to current month

### Pagination (Bottom)
- **← Previous / Next →**: Navigate through team members
- **Dropdown**: Change items per page (5, 8, 10, 20, 50, Show All)

---

## ✨ Features

### Cell Features
- **Empty cells**: Show "—" dash
- **Single assignment**: Shows project card with %
- **Multiple assignments**: Shows all cards + total allocation badge
- **Over-allocation**: Red badge + pulsing animation when > 100%

### Card Features
- **Click**: Toggle tooltip
- **Hover**: Show detailed tooltip with:
  - Project name
  - Client name
  - Person name
  - Date range
  - Duration in days
  - Allocation %
- **Delete button**: Hover to show × button to delete assignment

### Sorting & Grouping
- Sidebar groups people by role
- Sidebar groups projects by client
- Click to expand/collapse groups

---

## 🎯 Expected Behavior with Sample Data

After adding sample data, you'll see:

**January 2026:**
- Sarah Johnson: 80% (Website Redesign)
- Mike Chen: 50% (Website Redesign)
- Emily Rodriguez: 60% (Website Redesign)

**February 2026:**
- Sarah Johnson: 80% (Website Redesign)
- Mike Chen: 90% (Website Redesign + Mobile App) ⚠️ Near capacity
- Emily Rodriguez: 60% (Website Redesign)
- David Kim: 100% (Mobile App)

**March 2026:**
- Emily Rodriguez: 60% (Website Redesign)
- David Kim: 100% (Mobile App)
- Mike Chen: 90% (Mobile App + Cloud Migration) ⚠️ Over-allocated
- Lisa Anderson: 75% (Cloud Migration)
- Robert Taylor: 100% (Cloud Migration)

---

## 🐛 Troubleshooting

### "No team members found"
- Add people using the 👤 button
- Or run the sample data script

### Grid not showing 6 months
- Check browser console (F12) for errors
- Make sure frontend restarted after file updates
- Try: `npm run dev` again

### Assignments not appearing
- Make sure dates overlap with visible months (Jan-Jun 2026)
- Check that person_id and project_id are valid
- Verify backend is running

### Colors all the same
- Each client gets a unique color from a 16-color palette
- If you only have 1 client, all projects will be the same color
- Add more clients to see different colors

### Over-allocation not showing
- Over-allocation (>100%) appears when multiple assignments overlap
- Badge turns red and pulses
- Try Mike Chen in February (should show 90%)

---

## 📝 Notes

### Date Format
- Backend expects: YYYY-MM-DD
- Display format: Jan 1, 2026

### Period Offset
- Offset 0 = January 2026
- Offset 1 = February 2026
- Negative offsets work (e.g., -1 = December 2025)

### Allocation Calculation
- Per-person, per-month total
- Sum of all assignment percentages that overlap the month
- Over 100% = over-allocated

---

## 🎉 Success!

You should now see a fully functional timeline with:
- ✅ Team members in first column
- ✅ 6 months displayed (Jan-Jun 2026)
- ✅ Assignment cards in cells
- ✅ Color-coded by client
- ✅ Heat map backgrounds
- ✅ Hover tooltips
- ✅ Navigation working
- ✅ Pagination working

**Enjoy your Resource Planner!** 🚀
