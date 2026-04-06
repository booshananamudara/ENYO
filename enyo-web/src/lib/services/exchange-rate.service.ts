import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

/** Get all exchange rate settings. */
export async function getAllExchangeRates() {
  return prisma.exchangeRateSetting.findMany({
    orderBy: { currency: 'asc' },
  });
}

/** Update an exchange rate setting. */
export async function updateExchangeRate(
  id: string,
  data: { baseRate?: number; surchargePercent?: number; isActive?: boolean },
  updatedBy?: string,
) {
  const setting = await prisma.exchangeRateSetting.findUnique({ where: { id } });
  if (!setting) throw new NotFoundError('Exchange rate setting not found');

  return prisma.exchangeRateSetting.update({
    where: { id },
    data: { ...data, updatedBy },
  });
}

/** Get an exchange rate by currency code. */
export async function getExchangeRateByCurrency(currency: string) {
  const setting = await prisma.exchangeRateSetting.findUnique({
    where: { currency },
  });
  if (!setting) throw new NotFoundError(`Exchange rate for ${currency} not found`);
  return {
    currency: setting.currency,
    baseRate: Number(setting.baseRate),
    surchargePercent: Number(setting.surchargePercent),
    isActive: setting.isActive,
  };
}

/** Get or update app settings. */
export async function getAppSetting(key: string) {
  const setting = await prisma.appSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

/** Upsert an app setting. */
export async function setAppSetting(key: string, value: unknown) {
  return prisma.appSetting.upsert({
    where: { key },
    update: { value: value as never },
    create: { key, value: value as never },
  });
}
