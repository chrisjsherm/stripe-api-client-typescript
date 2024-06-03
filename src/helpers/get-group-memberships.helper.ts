import { DateTime } from "luxon";
import { MoreThan } from "typeorm";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { AppDataSource } from "../db/data-source";

/**
 * Get FusionAuth group memberships associated with an organization. These
 * memberships are associated with subscriptions to products.
 * @param organizationId ID of the organization associated with this customer
 * @returns Array of FusionAuth group IDs
 */
export async function getProductGroupMembershipsByOrganization$$(
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
      expirationDateTime: MoreThan(DateTime.now().toISODate()),
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
