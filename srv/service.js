const cds = require("@sap/cds");

module.exports = class AccessService extends cds.ApplicationService {
  async init() {
    const { UserRoles, RoleApps } = cds.entities("vpa.ubac");

    const clean = (s) => String(s || "").trim().toLowerCase();

    // The ONE place that decides who the caller is.
    // No authentication: the UI sends the email from the shell (parameter or header).
    const caller = (req) =>
      clean((req.data && req.data.email) || (req.headers && req.headers["x-user-email"]));

    const rolesOf = async (id) =>
      (await SELECT.from(UserRoles).columns("role").where({ userId: id })).map((r) => r.role);

    // Only table-Admins may read or change the assignments
    this.before(["READ", "CREATE", "UPDATE", "DELETE"], "UserRoles", async (req) => {
      const roles = await rolesOf(caller(req));
      if (!roles.includes("Admin")) req.reject(403, "Admin role required");
    });

    this.before(["CREATE", "UPDATE"], "UserRoles", (req) => {
      if (req.data.roles) {
        return req.reject(400, "Apps are fixed per role and cannot be changed through UserRoles");
      }
      if (req.data.userId) req.data.userId = clean(req.data.userId);
    });

    this.on("me", async (req) => {
      const id = caller(req);
      const roles = id ? await rolesOf(id) : [];
      const apps = roles.length
        ? (await SELECT.from(RoleApps).columns("appKey").where({ role: { in: roles } })).map((r) => r.appKey)
        : [];
      return { userId: id, roles, apps: [...new Set(apps)] };
    });

    return super.init();
  }
};