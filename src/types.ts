export enum DeviceCondition {
  Poor = 'poor',
  Fair = 'fair',
  Good = 'good',
  Refurbished = 'refurbished',
}

export interface Device {
  brand: string;
  model: string;
  year?: number | string;
  storage?: string;
  color?: string;
  estimatedValue: number;
  condition: DeviceCondition;
}

export type OfferStatus = 'available' | 'pending' | 'accepted' | 'completed';

export interface TradeOffer {
  id: string;
  createdAt: string;
  offererUsername: string;
  isVerified?: boolean;
  offererDevice: Device;
  targetDevice: Device;
  priceTopUp: number;
  status: OfferStatus;
}
