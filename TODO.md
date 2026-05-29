- [ ] Inspect current request routing setup and confirm admin route mount points
- [ ] Add request logging middleware in backend/server.js to confirm /api/admin/login hits the server
- [ ] Add a small debug endpoint (optional) to list mounted route prefixes
- [ ] Run backend and verify logs show POST /api/admin/login
- [ ] Fix root cause based on logs (port/server instance mismatch, crashed route registration, or path mismatch)
- [ ] Re-test frontend admin login and confirm JSON response

