import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
  }

  
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @Column()
    password: string

    @Column({default : false})
    isActivate: boolean

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

}
