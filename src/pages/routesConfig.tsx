import  { ReactNode } from "react";
import { RoutePermittedRole } from "../shared/constants/AppConst";


export interface RouterConfigData {
  id: string;
  title: string;
  messageId: string;
  apiType: string;
  icon?: string | ReactNode;
  type: "item" | "group" | "collapse" | "divider";
  children?: RouterConfigData[];
  permittedRole?: RoutePermittedRole;
  color?: string;
  url?: string;
  exact?: boolean;
  count?: number;
}
