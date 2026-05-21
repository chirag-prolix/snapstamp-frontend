export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface CustomerUser extends BaseUser {
  type: 'customer';
  displayName: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  referralCode: string | null;
}

export interface MerchantUser extends BaseUser {
  type: 'merchant';
  businessName: string;
  businessDescription: string | null;
  city: string;
  state: string;
  country: string;
  address: string;
  postalCode: string | null;
  phoneForBusiness: string;
  website: string | null;
  taxId: string;
  bankAccountHolderName: string;
  onboardingStatus: 'PENDING' | 'ACTIVE' | 'REJECTED';
  isVerified: boolean;
  verificationDocuments: string[] | null;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string | null;
}

export type AppUser = CustomerUser | MerchantUser;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}

// ─── Stamp Cards ──────────────────────────────────────────────────────────────

export interface StampCard {
  id: string;
  cardNumber: string;
  displayName: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  currentStampCount: number;
  totalSlotsRequired: number;
  progress: number;
  bonusStamps: number;
  createdAt: string;
  lastStampAt: string | null;
  completedAt: string | null;
  expiresAt: string;
}

export interface Stamp {
  id: string;
  stampSequence: number;
  isBonus: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REDEEMED';
  collectedAt: string;
  expiresAt: string;
}

export interface StampCardDetail {
  stampCard: StampCard;
  stamps: Stamp[];
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'CASHBACK' | 'EXPERIENCE';
export type RewardStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';

export interface Reward {
  id: string;
  title: string;
  description: string;
  rewardType: RewardType;
  value: number;
  currency: string;
  stampRequirement: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  status: RewardStatus;
  expiresAt: string;
  terms: string | null;
  imageUrl: string | null;
  createdAt: string;
  distanceKm?: number;
  customerStampCount?: number;
}

export type RedemptionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface RewardRedemption {
  id: string;
  redeemCode: string;
  status: RedemptionStatus;
  redeemedAt: string;
  merchantApprovedAt: string | null;
  reward: Reward;
  voucherUrl: string | null;
  notes: string | null;
  customer?: { id: string; firstName: string; lastName: string; phone: string };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface MerchantStats {
  totals: {
    stampsIssued: number;
    rewardsRedeemed: number;
    customers: number;
  };
  last30Days: {
    stampsIssued: number;
    redemptions: number;
    activeCustomers: number;
  };
  topRewards: Array<{ id: string; title: string; redemptions: number }>;
}

export interface AdminStats {
  totals: {
    customers: number;
    merchants: number;
    activeRewards: number;
    stampsIssued: number;
    rewardsRedeemed: number;
  };
  last30Days: {
    newCustomers: number;
    newMerchants: number;
  };
}

// ─── Referral ─────────────────────────────────────────────────────────────────

export interface ReferralStats {
  referralCode: string | null;
  referralCount: number;
  referrals: Array<{ id: string; firstName: string; lastName: string; joinedAt: string }>;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  paymentType: string;
  paymentMethod: string | null;
  createdAt: string;
  processedAt: string | null;
  metadata: Record<string, unknown>;
}

export interface SubscribeOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt: string;
  plan: 'monthly' | 'annual';
}

// ─── Verification ─────────────────────────────────────────────────────────────

export interface VerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}
