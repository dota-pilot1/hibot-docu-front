import { useQuery } from "@tanstack/react-query";
import { organizationApi, OrganizationUser } from "../api/organizationApi";

export const useOrganizationUsers = () => {
  return useQuery<OrganizationUser[]>({
    queryKey: ["organization", "users"],
    queryFn: organizationApi.getUsers,
    staleTime: 1000 * 60 * 5,
  });
};
