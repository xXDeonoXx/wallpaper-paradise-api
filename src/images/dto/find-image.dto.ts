import Paginator from 'src/shared/Paginator';

export class FindImageParams extends Paginator {
  title?: string;

  email?: string;

  categories?: number[];

  uploader_id?: number;
}
