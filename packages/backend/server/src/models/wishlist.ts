import { Injectable } from '@nestjs/common';
import { type Wishlist } from '@prisma/client';

import { BaseModel } from './base';

export type { Wishlist };

@Injectable()
export class WishlistModel extends BaseModel {
  /**
   * Submit an email to wishlist
   * @param email - The email to submit
   * @returns true if successfully added, false if already exists
   */
  async submitEmail(email: string): Promise<boolean> {
    try {
      await this.db.wishlist.create({
        data: { email },
      });
      return true;
    } catch (error: any) {
      // If the email already exists (unique constraint violation), return false
      if (error.code === 'P2002') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if an email already exists in wishlist
   * @param email - The email to check
   * @returns true if exists, false otherwise
   */
  async exists(email: string): Promise<boolean> {
    const wishlist = await this.db.wishlist.findUnique({
      where: { email },
    });
    return !!wishlist;
  }
}
