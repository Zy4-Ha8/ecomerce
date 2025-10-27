import { IsOptional } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Gender } from 'src/enum/gender.enum';
import { Size } from 'src/Interfaces/size.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  brand: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.NOT_ANSWER })
  gender: Gender;

  @Column({ type: 'jsonb' })
  season: string[];

  @Column({ type: 'jsonb', default: [] })
  styleTags: string[];

  @Column({ type: 'jsonb', default: [] })
  sizes: Size[];

  @Column({ type: 'jsonb', default: [] })
  colors: string[];

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @Column({ default: 1 })
  stock: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  images: { url: string; publicId: string }[];

  @Column({ type: 'jsonb', nullable: true })
  thumbnail: { url: string; publicId: string };

  @Column({ default: false })
  isBestSeller: boolean;

  @Column({ default: false })
  isNewArrival: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
