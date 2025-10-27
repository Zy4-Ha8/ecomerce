import { AccountStatusEnum } from 'src/enum/AcountStatus.enum';
import { UserRole } from 'src/enum/user-role.enum';
import { Verification } from 'src/verification/entities/verification.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column('json', { nullable: true })
  userAvatar: {
    public_id: string;
    url: string;
  };

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: 'InActive',
  })
  accountStatus: AccountStatusEnum;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @OneToMany(() => Verification, (vertification) => vertification.user)
  verification: Verification[];
}
