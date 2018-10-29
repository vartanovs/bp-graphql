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

  @Column('varchar', { length: 255 })
  email: string;

  @Column('text', { nullable: true })
  password: string | null;

  @Column('text', { nullable: true })
  googleId: string | null;

  @Column('boolean', { default: false })
  confirmed: boolean;

  @Column('boolean', { default: false })
  forgotPasswordLocked: boolean;

  // Hash password before inserting into database
  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, SALT);
    }
  }
}