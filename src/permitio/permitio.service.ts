import { Injectable } from '@nestjs/common';
import { Permit } from 'permitio';

@Injectable()
export class PermitService {
  private permit: Permit;

  constructor() {
    this.permit = new Permit({
      pdp: process.env.PERMIT_IO_PDP,
      token: process.env.PERMIT_IO_TOKEN,
    });
  }

  getPermitInstance(): Permit {
    return this.permit;
  }
}
