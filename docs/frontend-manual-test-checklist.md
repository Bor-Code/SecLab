# Frontend Manual Test Checklist

## Environment
- Backend runs with FastAPI on http://127.0.0.1:8000
- Frontend runs with Vite
- PostgreSQL database is available
- Test data includes regular users and an admin test account

## Build Validation
- [ ] Run `npm --prefix ./frontend run build`
- [ ] Confirm the production build completes successfully

## Dashboard
- [ ] Summary cards show Users, Topics, Learning Logs, and Resources counts
- [ ] Records Overview does not show Mantis demo analytics
- [ ] System Health displays API and database status
- [ ] Recent Activity shows latest records or an empty state
- [ ] Header GitHub button opens the project owner GitHub profile
- [ ] Demo notifications are hidden

## Users
- [ ] User list loads from the API
- [ ] User search filters by username and email
- [ ] User pagination works with 10, 25, and 50 rows
- [ ] Create user succeeds with valid username and email
- [ ] Edit user updates the table
- [ ] Delete opens a MUI confirmation dialog
- [ ] Confirm delete removes the user
- [ ] Cancel delete keeps the user

## Topics
- [ ] Topic list loads from the API
- [ ] User dropdown is populated
- [ ] Create topic succeeds
- [ ] Topic search filters records
- [ ] Edit topic updates the table
- [ ] Delete uses a MUI confirmation dialog

## Learning Logs
- [ ] Learning log list loads from the API
- [ ] User dropdown is populated
- [ ] Topic dropdown is populated
- [ ] Create learning log succeeds
- [ ] Search filters by title, notes, user, or topic
- [ ] Edit learning log updates the table
- [ ] Delete uses a MUI confirmation dialog

## Resources
- [ ] Resource list loads from the API
- [ ] User dropdown is populated
- [ ] Topic dropdown is populated
- [ ] Create resource succeeds
- [ ] Open link opens the resource URL in a new tab
- [ ] Search filters by title, URL, type, notes, user, or topic
- [ ] Edit resource updates the table
- [ ] Delete uses a MUI confirmation dialog

## Monitoring
- [ ] System Health page loads API health data
- [ ] System Health page shows an error when backend is unavailable
- [ ] Recent Activity page loads activity records
- [ ] Recent Activity search filters by type, title, and description

## Known Limitations
- Authentication is not implemented yet
- Admin role is not implemented yet
- Backend pagination is not implemented yet
- Delete dialogs are implemented per page and are not shared as a reusable component yet