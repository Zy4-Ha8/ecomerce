import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilterProductDto } from './dto/filter-product.dto';
import { NoAccout } from 'src/decorators/noAccount.decorator';
import { Public } from 'src/decorators/IsPublic.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @NoAccout()
  @Public()
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
  )
  create(
    @Body() createProductDto: CreateProductDto,

    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const thumbnail = files?.thumbnail?.[0] || undefined;
    const images = files?.images || [];
    return this.productsService.create(createProductDto, thumbnail, images);
  }
  @NoAccout()
  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @NoAccout()
  @Public()
  @Get('pagination')
  findPagination(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    console.log('page', page, 'limit', limit);
    return this.productsService.findPagination(page, limit);
  }
  @NoAccout()
  @Public()
  @Get('search')
  findSearch(@Query('search') search: string) {
    return this.productsService.findSearch(search);
  }
  @NoAccout()
  @Public()
  @Get('filter')
  findFilter(@Query() dto: FilterProductDto) {
    return this.productsService.findFilter(dto);
  }
  @NoAccout()
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
  )
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const thumbnail = files?.thumbnail?.[0] || undefined;
    const images = files?.images || [];
    return this.productsService.update(
      +id,
      updateProductDto,
      thumbnail,
      images,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
