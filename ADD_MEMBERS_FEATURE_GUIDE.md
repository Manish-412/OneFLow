# Add Team Members Feature Guide

## 🎯 Overview

The **Add Team Members** feature allows project managers and admins to easily add multiple team members to tasks and projects with a beautiful, user-friendly modal interface.

## ✨ Features

### 1. **Multiple Ways to Add Members**
- 📱 Click "+ Add" button in team members section
- ⚙️ Select from three-dot menu
- 🖱️ Click the "+" avatar button in the team list

### 2. **Smart Search & Filter**
- 🔍 Search by name, email, or role
- ✅ Shows only available members (not already assigned)
- 🚀 Real-time filtering as you type

### 3. **Visual Selection**
- 👁️ See avatar previews of selected members
- ✓ Checkboxes for easy multi-select
- 🎨 Color-coded selection states

### 4. **Batch Operations**
- ➕ Add multiple members at once
- 📊 Counter shows how many selected
- 🔄 One-click add all selected members

## 🎨 Visual Elements

### Task Card - Add Member Buttons

```
┌─────────────────────────────────────┐
│ Status & Priority Info              │
│                                     │
│ 👥 Team Members (3)      [+ Add]   │
│ ┌──┬──┬──┬───┐                     │
│ │JD││JS││BW││ + │ ← Click to add  │
│ └──┴──┴──┴───┘                     │
└─────────────────────────────────────┘
```

### Add Member Modal

```
┌───────────────────────────────────────┐
│ 👥 Add Team Members            ✕      │
├───────────────────────────────────────┤
│ 🔍 Search by name, email, or role...  │
├───────────────────────────────────────┤
│ Selected (2)                          │
│ 👤 👤 ← Click to remove              │
├───────────────────────────────────────┤
│ ┌─────────────────────────────────┐  │
│ │ 👤  John Doe                 ✓ │  │
│ │     Developer                   │  │
│ │     john@example.com            │  │
│ │                                 │  │
│ │ 👤  Jane Smith               ✓ │  │
│ │     Designer                    │  │
│ │     jane@example.com            │  │
│ │                                 │  │
│ │ 👤  Bob Wilson               ☐ │  │
│ │     QA Engineer                 │  │
│ │     bob@example.com             │  │
│ └─────────────────────────────────┘  │
├───────────────────────────────────────┤
│ [Cancel]  [+ Add (2)]                │
└───────────────────────────────────────┘
```

## 🚀 How to Use

### For Tasks

1. **Open Tasks Page**
   - Navigate to Tasks section

2. **Find the Task**
   - Locate the task you want to add members to

3. **Add Members**
   - **Option A**: Click "+ Add" button next to "Team Members"
   - **Option B**: Click the blue "+" avatar
   - **Option C**: Click ⋮ menu → "👥 Add Team Member"

4. **Select Members**
   - Search or browse available team members
   - Click on members to select (checkmark appears)
   - Selected members show at the top

5. **Confirm**
   - Click "Add (X)" button to add selected members
   - Members instantly appear on the task card

### For Projects

Similar process:
1. Go to Projects page
2. Find your project
3. Click "Add Members" option
4. Select team members
5. Confirm addition

## 🎯 Button Locations

### Task Card Buttons

#### 1. Header "+ Add" Button
```css
Location: Top right of "Team Members" section
Style: Small blue button
Text: "+ Add"
```

#### 2. Avatar "+" Button
```css
Location: In the avatar row, after existing avatars
Style: Circular blue button with "+"
Size: Same as avatar circles (40px)
```

#### 3. Menu Option
```css
Location: Three-dot menu (⋮)
Option: "👥 Add Team Member"
```

## 🎨 Styling Details

### Add Member Buttons

```css
/* Small Add Button */
.add-member-btn-small {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

/* Avatar + Button */
.team-avatar-add {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  font-size: 20px;
  color: #ffffff;
}

/* Icon Button (for single user) */
.add-member-icon-btn {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
}
```

### Modal Styling

```css
/* Modal Container */
.add-member-modal {
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(20, 18, 50, 0.98) 100%);
  border-radius: 20px;
  max-width: 600px;
  max-height: 80vh;
}

/* Member Item */
.member-item {
  padding: 14px 28px;
  transition: all 0.3s ease;
}

.member-item.selected {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}
```

## 🔧 Backend Integration

### API Endpoints Needed

#### 1. Get Available Users
```javascript
GET /api/users
Headers: Authorization: Bearer <token>
Response: {
  users: [
    {
      id: 1,
      username: "john.doe",
      full_name: "John Doe",
      email: "john@example.com",
      role: "developer"
    },
    ...
  ]
}
```

#### 2. Add Members to Task
```javascript
POST /api/tasks/:taskId/members
Headers: Authorization: Bearer <token>
Body: {
  members: [1, 2, 3] // user IDs
}
Response: {
  success: true,
  message: "Members added successfully"
}
```

#### 3. Add Members to Project
```javascript
POST /api/projects/:projectId/members
Headers: Authorization: Bearer <token>
Body: {
  members: [1, 2, 3] // user IDs
}
Response: {
  success: true,
  message: "Members added successfully"
}
```

### Database Schema

#### team_members table
```sql
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL, -- 'task' or 'project'
  entity_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(50),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (added_by) REFERENCES users(id)
);
```

## 💡 Usage Examples

### Example 1: Add Members to High-Priority Task

```javascript
// User clicks "+ Add" on a task card
Task ID: 15
Current Members: ["John Doe"]

// Modal opens showing available users
Available Users: 
  - Jane Smith (Designer)
  - Bob Wilson (QA)
  - Alice Johnson (Developer)

// User selects Jane and Bob
Selected: [Jane Smith, Bob Wilson]

// User clicks "Add (2)"
API Call: POST /api/tasks/15/members
Body: { members: [2, 3] }

// Task card updates to show:
Team Members (3): 
  👤 JD  👤 JS  👤 BW
```

### Example 2: Add Multiple Members to Project

```javascript
// From Projects page
Project: "Web Application Redesign"
Current Members: ["Project Manager"]

// User clicks "Add Members"
// Selects 5 developers and 2 designers

API Call: POST /api/projects/8/members
Body: { members: [10, 11, 12, 13, 14, 15, 16] }

// Project card shows:
Team Members (8): 
  👤 PM  👤 D1  👤 D2  👤 D3  +5 more
```

## 🎯 Permissions

### Who Can Add Members?

✅ **Can Add:**
- Admin users (userRole === 'admin')
- Project Managers (userRole === 'project_manager')

❌ **Cannot Add:**
- Regular team members
- Viewers
- Guests

### Permission Check
```javascript
const canEdit = userRole === 'admin' || userRole === 'project_manager';

// In TaskCard component
onAddMember={canEdit ? handleAddMember : undefined}
```

## 🎨 Animation Effects

### Hover Effects

1. **Button Hover**
   - Scale up slightly (1.05x)
   - Brighten background
   - Add shadow

2. **Avatar Hover**
   - Scale up (1.15x)
   - Lift with translateY(-4px)
   - Increase shadow intensity

3. **Modal Item Hover**
   - Background highlight
   - Border color change
   - Avatar scale animation

## 📱 Responsive Design

### Mobile Adjustments

```css
@media (max-width: 640px) {
  .add-member-modal {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .team-avatars-group {
    flex-wrap: wrap;
  }
  
  .add-member-btn-small {
    font-size: 10px;
    padding: 3px 8px;
  }
}
```

## 🔍 Search Functionality

### Search Filters

```javascript
const filteredMembers = availableMembers.filter(member =>
  member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  member.role.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Search Examples

- "john" → Matches "John Doe"
- "dev" → Matches role "Developer"
- "@gmail" → Matches emails with gmail.com

## ✅ Best Practices

### 1. **Always Show Feedback**
```javascript
// Success message
alert(`Successfully added ${members.length} member(s)!`);

// Error handling
catch (error) {
  alert('Failed to add members. Please try again.');
}
```

### 2. **Prevent Duplicates**
```javascript
const currentMemberIds = currentMembers.map(m => m.id);
const available = allUsers.filter(user => 
  !currentMemberIds.includes(user.id)
);
```

### 3. **Show Loading States**
```javascript
{isLoading ? (
  <div className="loading-state">
    <div className="loading-spinner"></div>
    <p>Loading team members...</p>
  </div>
) : (
  // Member list
)}
```

### 4. **Maintain State**
```javascript
// Reset state on close
const handleClose = () => {
  setSelectedMembers([]);
  setSearchQuery('');
  onClose();
};
```

## 🚀 Next Steps

1. **Implement Backend API**
   - Create `/api/users` endpoint
   - Create `/api/tasks/:id/members` endpoint
   - Create `/api/projects/:id/members` endpoint

2. **Add Role Management**
   - Allow assigning specific roles to members
   - Show role selection dropdown

3. **Add Notifications**
   - Notify members when added to task/project
   - Email notifications

4. **Member Management**
   - Remove members
   - Change member roles
   - View member activity

## 📊 Component Props

### AddMemberModal Props

```typescript
interface AddMemberModalProps {
  isOpen: boolean;              // Control modal visibility
  onClose: () => void;          // Close handler
  onAddMembers: (members: TeamMember[]) => void; // Add handler
  title?: string;               // Modal title (optional)
  currentMembers?: TeamMember[]; // Already assigned members
  entityType?: 'task' | 'project'; // Type of entity
}
```

### TaskCard Props (Added)

```typescript
interface TaskCardProps {
  // ... existing props
  assignedUsers?: Array<{     // Multiple team members
    name: string;
    avatar: string;
    role?: string;
  }>;
  onAddMember?: (id: number) => void; // Add member handler
}
```

## 🎯 Summary

The Add Team Members feature provides a seamless way to:
- ✅ Add multiple members at once
- 🔍 Search and filter available users
- 👁️ Preview selections before adding
- 🎨 Beautiful, animated UI
- 📱 Mobile-responsive design
- 🔒 Role-based permissions

Perfect for modern project management workflows!
