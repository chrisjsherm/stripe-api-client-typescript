import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

export abstract class CoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdDateTime: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedDateTime: Date;

  @DeleteDateColumn({ type: "timestamp with time zone" })
  deletedDateTime?: Date;

  @VersionColumn()
  version: number;
}
