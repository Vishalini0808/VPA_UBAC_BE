using vpa.ubac as db from '../db/schema';

@path: '/access'
service AccessService {

  entity UserRoles as projection on db.UserRoles;

  @readonly
  entity RoleApps as projection on db.RoleApps;

  type MyAccess {
    userId : String;
    roles  : array of String;
    apps   : array of String;
  };

  function me(email : String) returns MyAccess;
}