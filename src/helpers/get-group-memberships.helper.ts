import { DateTime } from "luxon";
import { MoreThan } from "typeorm";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { AppDataSource } from "../db/data-source";

/**
 * Get FusionAuth group memberships by organization that apply to all members
 * of an organization.
 * @param organizationId ID of the organization associated with this customer
 * @returns Array of FusionAuth group IDs
 */
export async function getDefaultMembershipsByOrganization$(
  organizationId: string
): Promise<Set<string>> {
  const subscriptions = await AppDataSource.getRepository(
    ProductSubscription
  ).find({
    relations: {
      product: true,
    },
    where: {
      organization: {
        id: organizationId,
      },
      expirationDateTime: MoreThan(DateTime.now().toJSDate()),
    },
  });

  const groupIds = new Set<string>();
  for (const subscription of subscriptions) {
    const ids = subscription.product.groupMembershipsCsv.split(",");
    for (const id of ids) {
      groupIds.add(id);
    }
  }

  return groupIds;
}
