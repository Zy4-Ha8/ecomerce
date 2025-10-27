import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { CloudinaryService } from 'src/cloudinary/cloudinaryService.service';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private categoryService: CategoriesService,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    thumbnail?: Express.Multer.File,
    images?: Express.Multer.File[],
  ) {
    const category = await this.categoryService.findOne(
      createProductDto.category_id,
    );

    if (!category) {
      throw new NotFoundException(
        `the category with the id ${createProductDto.category_id} not found`,
      );
    }

    const thumbnailImageUpload = thumbnail
      ? await this.cloudinaryService.uploadImage(thumbnail, 'products')
      : undefined;

    const uploads = images
      ? await Promise.all(
          images.map((image) =>
            this.cloudinaryService.uploadImage(image, 'products'),
          ),
        )
      : undefined;

    const productToCreate = {
      ...createProductDto,
      thumbnail: thumbnailImageUpload,
      images: uploads,
    };
    const product = this.productRepo.create(productToCreate);

    return {
      message: 'The product has been added ',
      data: await this.productRepo.save(product),
    };
  }

  async findAll() {
    const allProducts = await this.productRepo.find();
    return { message: 'all products returned succefully ', data: allProducts };
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    return { message: 'the product return succefully', data: product };
  }

  async findPagination(page: number, limit: number) {
    const [data, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return {
      currentPage: page,
      totalItem: total,
      totalPage: Math.ceil(total / limit),
      data,
    };
  }

  async findSearch(search: string) {
    const queryBuilder = this.productRepo.createQueryBuilder('product');
    if (search) {
      queryBuilder.where(
        'LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search',
        { search: `%${search.toLocaleLowerCase()}%` },
      );
    }
    const products = await queryBuilder.getMany();
    return {
      message: products.length
        ? 'the product return succefully '
        : 'there is no products match ',
      data: products,
    };
  }

  async findFilter(dto: FilterProductDto) {
    const query = this.productRepo.createQueryBuilder('product');
    // *=====filtering======*
    if (dto.categoryId) {
      query.andWhere('product.category_id = :categoryId', {
        category_id: dto.categoryId,
      });
    }

    if (dto.isBestSeller) {
      query.andWhere('product.isBestSeller = true');
    }
    if (dto.isFeatured) {
      query.andWhere('product.isFeatured = true');
    }
    if (dto.isNewArrival) {
      query.andWhere('product.isNewArrival = true');
    }
    if (dto.brand) {
      query.andWhere('product.brand = :brand', { brand: dto.brand });
    }
    if (dto.gender) {
      query.andWhere('product.gender = :gender', { gender: dto.gender });
    }
    if (dto.season) {
      query.andWhere('product.season = :season', { season: dto.season });
    }
    if (dto.colors) {
      const arrayOfColors = dto.colors.split(',');
      query.andWhere('product.colors @> :colors', {
        colors: JSON.stringify(arrayOfColors),
      });
    }
    if (dto.sizes) {
      const arrayOfSizes = dto.sizes.split(',');
      query.andWhere('product.sizes @> :sizes', {
        sizes: JSON.stringify(arrayOfSizes),
      });
    }
    if (dto.styleTags) {
      const arrayOfStyleTags = dto.styleTags.split(',');
      query.andWhere('product.styleTags @> :styleTags', {
        styleTags: JSON.stringify(arrayOfStyleTags),
      });
    }
    if (dto.minPrice && dto.maxPrice) {
      query.andWhere('product.price BETWEEN :min AND :max', {
        min: Number(dto.minPrice),
        max: Number(dto.maxPrice),
      });
    } else if (dto.minPrice) {
      query.andWhere('product.price >= :min', { min: Number(dto.minPrice) });
    } else if (dto.maxPrice) {
      query.andWhere('product.price <= :max', { max: Number(dto.maxPrice) });
    }

    if (dto.hasDiscount === 'true') {
      query.andWhere('CAST(product.discountPrice AS FLOAT) > 0');
    } else if (dto.hasDiscount === 'false') {
      query.andWhere('CAST(product.discountPrice AS FLOAT) = 0');
    }

    
    if (dto.minDiscountPrice) {
      query.andWhere('product.discountPrice > :minDiscountPrice', {
        minDiscountPrice: dto.minDiscountPrice,
      });
    }
    // * ======sorting====== *

    if (dto.sortBy && dto.sortOrder) {
      const sortBy = dto.sortBy || 'created_at';
      const sortOrder = dto.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(`product.${sortBy}`, sortOrder);
    }
    // * =====pagination===== *
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return {
      currentPage: page,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    thumbnail?: Express.Multer.File,
    newImages?: Express.Multer.File[],
  ) {
    const product = (await this.findOne(id)).data;
    if (!product) {
      throw new NotFoundException('the product not found');
    }
    if (thumbnail) {
      await this.cloudinaryService.deleteImage(product?.thumbnail?.publicId);
      const newThumbail = await this.cloudinaryService.uploadImage(
        thumbnail,
        'products',
      );
      product.thumbnail = newThumbail;
    }

    if (updateProductDto.removeImagesPublicIds?.length) {
      product.images = product.images.filter((image) => {
        if (updateProductDto.removeImagesPublicIds?.includes(image.publicId)) {
          this.cloudinaryService.deleteImage(image.publicId);
          return false;
        }
        return true;
      });
    }
    if (newImages?.length) {
      const uploadImages = await Promise.all(
        newImages.map((image) =>
          this.cloudinaryService.uploadImage(image, 'products'),
        ),
      );
      product.images.push(...uploadImages);
    }

    const { removeImagesPublicIds, ...safeDto } = updateProductDto;
    Object.assign(product, safeDto);
    return {
      message: 'Product updated successfully',
      data: await this.productRepo.save(product),
    };
  }

  async remove(id: number) {
    const product = (await this.findOne(id)).data;
    if (!product) {
      throw new NotFoundException('the product not found');
    }
    await this.cloudinaryService.deleteImage(product.thumbnail.publicId);

    await Promise.all(
      product.images.map((image) =>
        this.cloudinaryService.deleteImage(image.publicId),
      ),
    );

    await this.productRepo.remove(product);
    return `This action removes a #${id} product`;
  }
}
