import { SetMetadata } from '@nestjs/common';

// Use this as a Decorator to set a route as Public accessible

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
