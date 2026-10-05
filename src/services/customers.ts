import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  cleanPhone: string;
  formattedPhone: string;
  institution: string;
  address: string;
  totalSpent: number;
  orderCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  lastOrderStatus: string;
  lastInvoiceId: string;
  lastOrderItems: string;
  lastOrderTotal: number;
  orderIds: string[];
  channels: string[];
  cabangs: string[];
}

export interface WhatsAppMessageTemplate {
  id: string;
  title: string;
  badge: string;
  buildText: (c: CustomerSummary) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppMessageTemplate[] = [
  {
    id: 'followup',
    title: 'Follow-up & Terima Kasih',
    badge: 'Rekomendasi',
    buildText: (c) => {
      const invText = c.lastInvoiceId ? ` dengan no invoice ${c.lastInvoiceId}` : '';
      return `Halo Kak ${c.name}, terima kasih banyak sudah memesan di Tidurlah Grafika${invText}. Bagaimana hasil cetakannya kak, apakah sudah sesuai dan memuaskan? Jika ada kebutuhan cetak ID card, lanyard, atau merchandise lainnya, kami siap membantu kembali.`;
    },
  },
  {
    id: 'repeat-order',
    title: 'Penawaran Repeat Order / Promo',
    badge: 'Promo',
    buildText: (c) => {
      const instansiText = c.institution && c.institution !== '-' && c.institution.toLowerCase() !== 'umum' ? ` untuk ${c.institution}` : '';
      return `Halo Kak ${c.name}, salam dari tim Tidurlah Grafika. Kami ingin mengabarkan bahwa saat ini ada promo khusus dan pengerjaan express untuk pesanan cetak berikutnya${instansiText}. Apakah ada proyek cetak baru yang ingin dikonsultasikan? Kami siap memberikan penawaran terbaik.`;
    },
  },
  {
    id: 'confirm-last',
    title: 'Konfirmasi Pesanan Terakhir',
    badge: 'Operasional',
    buildText: (c) => {
      const invText = c.lastInvoiceId ? ` (${c.lastInvoiceId})` : '';
      return `Halo Kak ${c.name}, kami dari tim Tidurlah Grafika ingin mengonfirmasi terkait pesanan terakhir Anda${invText}. Apakah ada file desain tambahan atau hal yang perlu kami bantu kembali?`;
    },
  },
  {
    id: 'quick-hello',
    title: 'Sapaan Cepat',
    badge: 'Singkat',
    buildText: (c) => {
      return `Halo Kak ${c.name}, salam dari Tidurlah Grafika. Ada kebutuhan cetak yang bisa kami bantu hari ini?`;
    },
  },
];

export interface CustomerOrderDetail {
  orderId: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  institution: string;
  address: string;
  total: number;
  orderStatus: string;
  itemsSummary: string;
  cashier: string;
  channel: string;
  cabang: string | null;
}

export interface ExportGoogleContactsConfig {
  phoneFormat: 'formatted' | 'e164' | 'raw';
  lastNameMode: 'institution' | 'blank';
  ignoreGenericInstitution: boolean;
  label: string;
  phoneLabel: 'Mobile' | 'Home' | 'Work';
  includeNotes: boolean;
  onlyWithPhone: boolean;
}

export const DEFAULT_EXPORT_CONFIG: ExportGoogleContactsConfig = {
  phoneFormat: 'formatted',
  lastNameMode: 'institution',
  ignoreGenericInstitution: true,
  label: '* myContacts ::: Pelanggan Tidurlah',
  phoneLabel: 'Mobile',
  includeNotes: true,
  onlyWithPhone: true,
};

/**
 * Clean phone string to digits only.
 */
export function extractDigits(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normalize Indonesian phone digits to international format (628...).
 */
export function normalizeIndonesianPhone(raw: string): string {
  const digits = extractDigits(raw);
  if (!digits) return '';
  if (digits.startsWith('08')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('8')) {
    return '62' + digits;
  }
  return digits;
}

/**
 * Format Indonesian phone number according to user preference.
 * e.g. +62 812-7247-7625, +6281272477625, or original raw string.
 */
export function formatPhoneNumber(raw: string, mode: 'formatted' | 'e164' | 'raw' = 'formatted'): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (mode === 'raw') return trimmed;

  const normalized = normalizeIndonesianPhone(trimmed);
  if (!normalized) return trimmed;

  if (mode === 'e164') {
    return normalized.startsWith('+') ? normalized : `+${normalized}`;
  }

  // mode === 'formatted': +62 8xx-xxxx-xxxx[x]
  if (normalized.startsWith('62') && normalized.length >= 9) {
    const part1 = normalized.slice(2, 5); // 812
    const part2 = normalized.slice(5, 9); // 7247
    const part3 = normalized.slice(9);    // 7625
    if (part3) {
      return `+62 ${part1}-${part2}-${part3}`;
    }
    return `+62 ${part1}-${part2}`;
  }

  return `+${normalized}`;
}

/**
 * Format currency to IDR string.
 */
export function formatCurrencyIDR(val: number): string {
  return `Rp ${(val || 0).toLocaleString('id-ID')}`;
}

/**
 * Format ISO timestamp to readable date string.
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO timestamp to relative time in Indonesian.
 * e.g. "Baru saja", "15 menit lalu", "2 jam lalu", "Kemarin", "3 hari lalu", "2 minggu lalu"
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Baru saja';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay === 1) return 'Kemarin';
    if (diffDay < 7) return `${diffDay} hari lalu`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} bln lalu`;
    return `${Math.floor(diffDay / 365)} thn lalu`;
  } catch {
    return isoString;
  }
}

/**
 * Fetch all customers aggregated from Supabase orders table.
 * Handles pagination chunks to bypass the 1,000-row PostgREST default limit.
 */
export async function fetchCustomersData(): Promise<{
  success: boolean;
  customers: CustomerSummary[];
  totalOrders: number;
  error?: string;
}> {
  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      customers: [],
      totalOrders: 0,
      error: 'Supabase is not configured',
    };
  }

  try {
    const allOrders: Array<{
      order_id: string;
      customer_name: string;
      customer_phone: string;
      institution: string;
      address: string;
      timestamp: string;
      total: number;
      order_status: string;
      channel: string;
      cabang: string | null;
      items_summary?: string;
    }> = [];

    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('orders')
        .select('order_id, customer_name, customer_phone, institution, address, timestamp, total, order_status, channel, cabang, items_summary')
        .is('deleted_at', null)
        .order('timestamp', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('[Customers] Fetch error:', error);
        return {
          success: false,
          customers: [],
          totalOrders: 0,
          error: error.message,
        };
      }

      if (!data || data.length === 0) {
        break;
      }

      allOrders.push(...data);
      if (data.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    const customerMap = new Map<string, CustomerSummary>();

    for (const order of allOrders) {
      const rawName = (order.customer_name || '').trim();
      const rawPhone = (order.customer_phone || '').trim();
      const cleanPhone = normalizeIndonesianPhone(rawPhone);
      const instansi = (order.institution || '').trim();
      const address = (order.address || '').trim();

      // Key: cleanPhone if available, else normalized customer name
      const key = cleanPhone || rawName.toLowerCase();
      if (!key) continue;

      const formatted = cleanPhone ? formatPhoneNumber(rawPhone, 'formatted') : '';

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: rawName || 'Tanpa Nama',
          phone: rawPhone,
          cleanPhone,
          formattedPhone: formatted,
          institution: instansi,
          address,
          totalSpent: order.total || 0,
          orderCount: 1,
          firstOrderDate: order.timestamp,
          lastOrderDate: order.timestamp,
          lastOrderStatus: order.order_status,
          lastInvoiceId: order.order_id,
          lastOrderItems: order.items_summary || '',
          lastOrderTotal: order.total || 0,
          orderIds: [order.order_id],
          channels: order.channel ? [order.channel] : [],
          cabangs: order.cabang ? [order.cabang] : [],
        });
      } else {
        const existing = customerMap.get(key)!;
        existing.orderCount += 1;
        existing.totalSpent += (order.total || 0);
        existing.orderIds.push(order.order_id);

        // Keep earlier order timestamp as firstOrderDate
        if (new Date(order.timestamp) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.timestamp;
        }
        // Keep later order timestamp as lastOrderDate
        if (new Date(order.timestamp) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.timestamp;
          existing.lastOrderStatus = order.order_status;
          existing.lastInvoiceId = order.order_id;
          existing.lastOrderItems = order.items_summary || '';
          existing.lastOrderTotal = order.total || 0;
        }

        // Prioritize non-empty, non-generic institution if existing is empty or generic
        const isGeneric = (str: string) => !str || str.toLowerCase() === 'umum' || str === '-';
        if (isGeneric(existing.institution) && !isGeneric(instansi)) {
          existing.institution = instansi;
        }

        // Fill address if existing is empty
        if (!existing.address && address) {
          existing.address = address;
        }

        // Prefer longer name if previous was short initial
        if (rawName && rawName.length > existing.name.length && !existing.name.includes(rawName)) {
          existing.name = rawName;
        }

        // Append distinct channels & branches
        if (order.channel && !existing.channels.includes(order.channel)) {
          existing.channels.push(order.channel);
        }
        if (order.cabang && !existing.cabangs.includes(order.cabang)) {
          existing.cabangs.push(order.cabang);
        }
      }
    }

    const customers = Array.from(customerMap.values()).sort((a, b) => {
      const dateA = new Date(a.lastOrderDate).getTime();
      const dateB = new Date(b.lastOrderDate).getTime();
      return dateB - dateA;
    });

    return {
      success: true,
      customers,
      totalOrders: allOrders.length,
    };
  } catch (err: unknown) {
    console.error('[Customers] Unexpected error:', err);
    return {
      success: false,
      customers: [],
      totalOrders: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Fetch detailed order items for a specific customer by order IDs.
 */
export async function fetchCustomerOrders(orderIds: string[]): Promise<CustomerOrderDetail[]> {
  if (!supabase || !isSupabaseConfigured() || !orderIds.length) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, timestamp, customer_name, customer_phone, institution, address, total, order_status, items_summary, cashier, channel, cabang')
      .in('order_id', orderIds)
      .order('timestamp', { ascending: false });

    if (error || !data) {
      console.error('[Customers] Failed to fetch customer orders:', error);
      return [];
    }

    return data.map(o => ({
      orderId: o.order_id,
      timestamp: o.timestamp,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      institution: o.institution,
      address: o.address,
      total: o.total,
      orderStatus: o.order_status,
      itemsSummary: o.items_summary,
      cashier: o.cashier,
      channel: o.channel,
      cabang: o.cabang,
    }));
  } catch (err) {
    console.error('[Customers] Error loading order history:', err);
    return [];
  }
}

/**
 * Update customer details across all their orders in Supabase.
 */
export async function updateCustomerInSupabase(params: {
  oldPhone: string;
  oldName: string;
  newName: string;
  newPhone: string;
  newInstitution: string;
  newAddress?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const updates: {
      customer_name: string;
      customer_phone: string;
      institution: string;
      address?: string;
    } = {
      customer_name: params.newName.trim(),
      customer_phone: params.newPhone.trim(),
      institution: params.newInstitution.trim(),
    };

    if (params.newAddress !== undefined) {
      updates.address = params.newAddress.trim();
    }

    let query = supabase.from('orders').update(updates);

    if (params.oldPhone && params.oldPhone.trim() !== '') {
      query = query.eq('customer_phone', params.oldPhone.trim());
    } else {
      query = query.eq('customer_name', params.oldName.trim());
    }

    const { error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Escape CSV string according to RFC 4180.
 */
function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate Google Contacts compliant CSV content.
 * Matches the 21-column template strictly:
 * First Name,Middle Name,Last Name,Phonetic First Name,Phonetic Middle Name,Phonetic Last Name,
 * Name Prefix,Name Suffix,Nickname,File As,Organization Name,Organization Title,Organization Department,
 * Birthday,Notes,Photo,Labels,E-mail 1 - Label,E-mail 1 - Value,Phone 1 - Label,Phone 1 - Value
 */
export function buildGoogleContactsCsv(
  customers: CustomerSummary[],
  config: ExportGoogleContactsConfig = DEFAULT_EXPORT_CONFIG
): string {
  const headers = [
    'First Name',
    'Middle Name',
    'Last Name',
    'Phonetic First Name',
    'Phonetic Middle Name',
    'Phonetic Last Name',
    'Name Prefix',
    'Name Suffix',
    'Nickname',
    'File As',
    'Organization Name',
    'Organization Title',
    'Organization Department',
    'Birthday',
    'Notes',
    'Photo',
    'Labels',
    'E-mail 1 - Label',
    'E-mail 1 - Value',
    'Phone 1 - Label',
    'Phone 1 - Value',
  ];

  const rows: string[] = [headers.join(',')];

  const filtered = config.onlyWithPhone
    ? customers.filter(c => Boolean(c.cleanPhone || c.phone.trim()))
    : customers;

  for (const c of filtered) {
    const firstName = c.name.trim();
    const middleName = '';

    let lastName = '';
    if (config.lastNameMode === 'institution') {
      const inst = (c.institution || '').trim();
      const isGeneric = !inst || inst.toLowerCase() === 'umum' || inst === '-';
      if (!config.ignoreGenericInstitution || !isGeneric) {
        lastName = inst;
      }
    }

    const phoneticFirstName = '';
    const phoneticMiddleName = '';
    const phoneticLastName = '';
    const namePrefix = '';
    const nameSuffix = '';
    const nickname = '';
    const fileAs = '';
    const orgName = '';
    const orgTitle = '';
    const orgDepartment = '';
    const birthday = '';

    let notes = '';
    if (config.includeNotes) {
      const lastDate = formatDateTime(c.lastOrderDate);
      notes = `Total: ${c.orderCount} pesanan (${formatCurrencyIDR(c.totalSpent)}) | Terakhir: ${lastDate}${c.address ? ' | Alamat: ' + c.address : ''}`;
    }

    const photo = '';
    const labels = config.label || '* myContacts';
    const emailLabel = '';
    const emailValue = '';
    const phoneLabel = config.phoneLabel || 'Mobile';
    const phoneValue = formatPhoneNumber(c.phone, config.phoneFormat);

    const row = [
      escapeCsv(firstName),
      escapeCsv(middleName),
      escapeCsv(lastName),
      escapeCsv(phoneticFirstName),
      escapeCsv(phoneticMiddleName),
      escapeCsv(phoneticLastName),
      escapeCsv(namePrefix),
      escapeCsv(nameSuffix),
      escapeCsv(nickname),
      escapeCsv(fileAs),
      escapeCsv(orgName),
      escapeCsv(orgTitle),
      escapeCsv(orgDepartment),
      escapeCsv(birthday),
      escapeCsv(notes),
      escapeCsv(photo),
      escapeCsv(labels),
      escapeCsv(emailLabel),
      escapeCsv(emailValue),
      escapeCsv(phoneLabel),
      escapeCsv(phoneValue),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}

/**
 * Trigger browser download for Google Contacts CSV file.
 * Adds UTF-8 BOM (\uFEFF) to guarantee correct character encoding.
 */
export function downloadGoogleContactsCsv(
  customers: CustomerSummary[],
  config: ExportGoogleContactsConfig = DEFAULT_EXPORT_CONFIG,
  filename?: string
): void {
  const csvContent = buildGoogleContactsCsv(customers, config);
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const dateStr = new Date().toISOString().slice(0, 10);
  const actualFilename = filename || `kontak-google-tidurlah-${dateStr}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', actualFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
