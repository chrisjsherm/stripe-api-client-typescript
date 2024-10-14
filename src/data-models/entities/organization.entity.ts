import { JSONSchemaType } from "ajv";
import { Column, Entity, OneToMany } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { IOrganization } from "../interfaces/organization.interface";
import { CoreEntity } from "./core-entity.model";
import { PhysicalLocation } from "./physical-location.entity";

/**
 * Organization database entity.
 */
@Entity()
export class Organization extends CoreEntity implements IOrganization {
  @Column({ type: "varchar" })
  name: string;

  @Column(() => StreetAddress)
  mailingAddress: StreetAddress;

  @Column({ type: "varchar", nullable: true })
  mailRecipientName?: string;

  @OneToMany(() => PhysicalLocation, (location) => location.organization, {
    // Enable saving physical locations from the organization side of the relationship.
    cascade: true,
  })
  physicalLocations: PhysicalLocation[];
}

/**
 * Validation schema for updating organization name.
 */
export const updateNameJsonSchema: JSONSchemaType<Pick<Organization, "name">> =
  {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 3,
        maxLength: 128,
      },
    },
    required: ["name"],
    additionalProperties: false,
  };
