import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinaryService.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const { name, description } = createCategoryDto;
    const categoryImage = file
      ? await this.cloudinaryService.uploadImage(file, 'Categories')
      : undefined;
    const category = this.categoryRepo.create({
      name,
      description,
      image_url: {
        url: categoryImage?.url,
        public_id: categoryImage?.publicId,
      },
    });
    const savedCategory = await this.categoryRepo.save(category);
    return { message: 'the category has been added ', data: savedCategory };
  }

  async findAll() {
    const allCategories = await this.categoryRepo.find();
    return allCategories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new UnprocessableEntityException('the category not found');
    }
    return category;
  }

  async findPagination(page: number, limit: number, search?: string) {
    const queryBuilder = this.categoryRepo.createQueryBuilder('category');
    if (search) {
      queryBuilder.where(
        'LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search',
        { search: `%${search.toLocaleLowerCase()}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(page - 1)
      .take(limit)
      .orderBy('category.created_at', 'DESC')
      .getManyAndCount();
    return {
      currentPage: page,
      totalItem: total,
      totalPage: Math.ceil(total / limit),
      data,
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.findOne(id);

    if (!category) {
      throw new UnprocessableEntityException('the category not found');
    }

    let imageData = { ...category.image_url };

    if (file) {
      if (category.image_url) {
        await this.cloudinaryService.deleteImage(category.image_url.public_id);
      }

      const newImage = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      imageData = {
        public_id: newImage.publicId,
        url: newImage.url,
      };
    }

    const dataToUpload: UpdateCategoryDto = {
      ...updateCategoryDto,
      image_url: imageData,
    };

    Object.assign(category, dataToUpload);
    const updatedCategory = await this.categoryRepo.save(category);
    return updatedCategory;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) {
      throw new UnprocessableEntityException('the category not found');
    }
    if (category.image_url) {
      await this.cloudinaryService.deleteImage(category.image_url.public_id);
    }
    const removedCategory = await this.categoryRepo.remove(category);
    return {
      message: 'the category has been succefully deleted',
      data: removedCategory,
    };
  }
}
