import { JSONSchemaType } from "ajv";
import { Column, Entity, ManyToOne } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { streetAddressJsonSchema } from "../interfaces/street-address.json-schema";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

@Entity()
export class PhysicalLocation extends CoreEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column(() => StreetAddress)
  physicalAddress: StreetAddress;

  @ManyToOne(
    () => Organization,
    (organization) => organization.physicalLocations
  )
  organization: Organization;

  @Column({ type: "uuid" })
  organizationId: string;
}

/**
 * Validation schema for creating a physical location.
 */
export const createPhysicalLocationJsonSchema: JSONSchemaType<
  Pick<PhysicalLocation, "name" | "physicalAddress">
> = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 3, maxLength: 128 },
    physicalAddress: { $ref: "#/definitions/streetAddress" },
  },
  required: ["name", "physicalAddress"],
  additionalProperties: false,
  definitions: {
    streetAddress: streetAddressJsonSchema,
  },
};
