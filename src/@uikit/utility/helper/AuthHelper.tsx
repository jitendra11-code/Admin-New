import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { authRole } from "../../../shared/constants/AppConst";





export const getUserFromAuth0 = (user: any) => {
  if (user)
    return {
      id: 1,
      uid: user.sub,
      displayName: user.name,
      UserName: user?.name,
      email: user.email,
      photoURL: user.picture,
      role: authRole.user,
    };
  return user;
};

export const getUserFromFirebase = (user: any) => {
  if (user)
    return {
      id: 1,
      uid: user.uid,
      displayName: user.displayName ? user.displayName : "Amit ",
      email: user.email,
      photoURL: user.photoURL ? user.photoURL : "/assets/images/avatar/A11.jpg",
      role: authRole.user,
    };
  return user;
};
export const getUserFromAWS = (user: any) => {
  if (user)
    return {
      id: 1,
      uid: user.username,
      displayName: user.attributes.name ? user.attributes.name : "User",
      UserName: user?.name || "",
      email: user.attributes.email,
      photoURL: user.photoURL,
      role: authRole.user,
    };
  return user;
};

export const getUserFromJwtAuth = (user: any) => {
  if (user)
    return {
      id: user?.UserId,
      uid: user?._id,
      displayName: user?.UserName,
      UserName: user?.UserName || "",
      email: user?.Email || "",
      photoURL: user?.avatar,
      role: user?.RoleName,
      vendorType: user?.VendorType || "",
      branchMasterId: user?.branchMasterId
    };
  return user;
};
