import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

/**
 * App user metadata not related to authentication/authorization.
 */
@Entity()
export class User extends CoreEntity {
  @Column({ type: "uuid", nullable: false })
  fusionAuthId: string;

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;
}
