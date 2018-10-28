import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Declare salt for encryption
const SALT = 12;

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  // Hash password before inserting into database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, SALT);
  }
}