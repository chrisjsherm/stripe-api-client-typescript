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

  @CreateDateColumn()
  createdDateTime: string;

  @UpdateDateColumn()
  updatedDateTime: string;

  @DeleteDateColumn()
  deletedDateTime?: string;

  @VersionColumn()
  version: number;
}
