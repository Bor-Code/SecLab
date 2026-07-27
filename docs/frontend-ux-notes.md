# Frontend UX Notes

## Completed Polish
- Replaced Mantis sidebar branding with SecLab branding.
- Removed Mantis Pro sidebar promotion.
- Updated GitHub header action to open the project owner profile.
- Hidden demo notification dropdown from the header.
- Removed the demo visitor analytics chart from the dashboard.
- Replaced browser delete confirmations with MUI confirmation dialogs for record pages.
- Added user table pagination for larger test datasets.

## Remaining Improvements
- Implement real authentication and protected routes.
- Add admin and regular user role support.
- Add backend pagination for large datasets.
- Add pagination to Topics, Learning Logs, and Resources tables.
- Replace repeated delete dialog code with a shared reusable component.
- Improve dashboard cards by replacing generic helper text with SecLab-specific context.
- Add consistent empty, loading, and error states across all pages.
- Add form-level validation messages for duplicate usernames, duplicate emails, and invalid URLs.
- Add audit/event logging for create, update, and delete actions.
- Add responsive checks for smaller screen sizes.

## Known Demo Template Areas
- Login and Register pages are still template-level pages and are not connected to real authentication.
- Profile/avatar header content is still template-based.
- Some theme/config names still reference Mantis internally but are not visible in the UI.