# Pathfinder Dynamic Student Learning Portal

A complete, production-ready Learning Management System (LMS) built for **Pathfinder**, an IT training institute specializing in Full Stack Development and Manual Testing.

---

## 1. Credentials & Initial Access

### Administrator Access
Access the separate Admin Login page via the small **"Admin Access"** link in the footer.

- **Initial Username / Email**: `pathfinder@3678`
- **Initial Password**: `Pathfinder@3678`

*Note: In accordance with high-grade security practices, passwords are cryptographically hashed using SHA-256 before verification and are never stored in plaintext in code, databases, or logs.*

### Demo Student Accounts
Students are created directly by the Administrator and assigned course access (no access codes required):

1. **Sarah Patel** (Enrolled in Full Stack Development with AI Tools):
   - Email: `sarah.patel@student.pathfinder.edu`
   - Password: `student123`
2. **Arjun Kumar** (Enrolled in Manual Testing):
   - Email: `arjun.kumar@student.pathfinder.edu`
   - Password: `student123`

---

## 2. Key Architecture & Features

### Original Branding
- Original round **Pathfinder** insignia preserved without distortion or recreation across the navbar, login screens, student dashboard, and admin console.

### Minimal White-Themed Landing Page
- Minimalist layout focused solely on the Pathfinder logo, a short welcome headline, brief portal description, the two flagship course cards, and the primary **Student Login** action.
- Free of cluttered statistics, marketing fluff, or public admin controls.
- Small, unobtrusive **Admin Access** link in the footer.

### Desktop Video Uploads
- Direct local computer file upload supporting **MP4** and **WebM** formats up to 500MB.
- Real-time progress bar feedback with file size and upload status.
- Persisted locally via browser IndexedDB (`PathfinderMediaDB`) and integrated with Supabase Storage (`course-videos` bucket).
- Alternative **Add Video URL** mode allows attaching protected stream or external video links.

### PDF Notes & Resources
- Direct PDF upload from desktop attached to specific courses, modules, and lessons.
- In-browser document view and offline download buttons.

### Live Masterclass Meetings
- Schedule Google Meet, Zoom, or Teams sessions with live links, date, time, and instructions.
- Visible only to actively enrolled students for that specific track.

### Strict Role-Based Access Control (RBAC)
- Students enrolled in Full Stack cannot view Manual Testing content or meetings, and vice-versa.
- Admin dashboard is protected and inaccessible to student accounts.

---

## 3. Supabase Cloud Configuration (Optional)

To connect your own cloud Supabase instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and execute `supabase/migrations/20261009_pathfinder_schema.sql`.
3. Create two storage buckets in **Storage**:
   - `course-videos` (Private, 500MB limit)
   - `course-pdfs` (Private, 50MB limit)
4. Add credentials to your `.env`:
   ```bash
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

---

## 4. Local Development & Deployment

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (Vercel / Cloud Run)
npm run build
```
