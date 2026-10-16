namespace vpa.ubac;

using { cuid } from '@sap/cds/common';

type RoleName : String(30) enum { Admin; MasterDataSubmitter; MasterDataApprover; PricingSubmitter; PricingApprover; }

@assert.unique: { userRole: [userId, role] }
entity UserRoles : cuid {
  userId : String(255) @mandatory;   // identity exactly as the token reports it, stored lower-case
  role   : RoleName    @mandatory;
  roles : Composition of many RoleApps on roles.userRole = $self;
}

entity RoleApps {
  key role   : RoleName;
  key appKey : String(30);
  userRole : Association to UserRoles;           // masterData | pricing | approval | userAccess
}