-- Add cabang column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cabang text;

-- Update get_orders function to return cabang
CREATE OR REPLACE FUNCTION public.get_orders(
  p_limit integer default 50,
  p_offset integer default 0,
  p_channel text default null,
  p_status text default null,
  p_cashier text default null,
  p_search text default null,
  p_include_deleted boolean default false,
  p_deleted_only boolean default false
)
returns json
language plpgsql
stable
as $$
declare
  result json;
  total_count bigint;
begin
  -- Count total matching rows
  select count(*) into total_count
  from public.orders o
  where
    ((p_deleted_only and o.deleted_at is not null)
    or (not p_deleted_only and (p_include_deleted or o.deleted_at is null)))
  and (p_channel is null or o.channel = p_channel)
  and (p_status is null or o.order_status = p_status)
  and (p_cashier is null or o.cashier = p_cashier)
  and (p_search is null or (
    o.customer_name ilike '%' || p_search || '%'
    or o.customer_phone ilike '%' || p_search || '%'
    or o.order_id ilike '%' || p_search || '%'
  ));

  -- Fetch orders with joined items and delivery
  select json_build_object(
    'success', true,
    'orders', coalesce((
      select json_agg(order_row order by order_row->>'timestamp' desc)
      from (
        select json_build_object(
          'orderId', o.order_id,
          'timestamp', o."timestamp",
          'channel', o.channel,
          'cashier', o.cashier,
          'customerName', o.customer_name,
          'customerPhone', o.customer_phone,
          'institution', o.institution,
          'subtotal', o.subtotal,
          'discount', o.discount,
          'total', o.total,
          'downPayment', o.down_payment,
          'remainingBalance', o.remaining_balance,
          'paymentMethod', o.payment_method,
          'orderStatus', case when o.deleted_at is not null then 'deleted' else o.order_status end,
          'itemCount', o.item_count,
          'itemsSummary', o.items_summary,
          'promoCode', o.promo_code,
          'promoDiscount', o.promo_discount,
          'designNote', o.design_note,
          'isShipping', o.is_shipping,
          'address', o.address,
          'deadline', o.deadline,
          'designer', o.designer,
          'notes', o.notes,
          'cabang', o.cabang,
          'items', coalesce((
            select json_agg(json_build_object(
              'productId', oi.product_id,
              'name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.unit_price,
              'subtotal', oi.subtotal,
              'modelCode', oi.model_code,
              'caseVariant', oi.case_variant,
              'lamination', oi.lamination,
              'width', oi.width,
              'height', oi.height,
              'dimensionText', oi.dimension_text,
              'area', oi.area
            ))
            from public.order_items oi
            where oi.order_id = o.order_id
          ), '[]'::json),
          'delivery', (
            select json_build_object(
              'recipientName', od.recipient_name,
              'recipientPhone', od.recipient_phone,
              'address', od.address,
              'shippingCost', od.ongkir,
              'status', od.delivery_status
            )
            from public.order_deliveries od
            where od.order_id = o.order_id
          )
        ) as order_row
        from public.orders o
        where
          ((p_deleted_only and o.deleted_at is not null)
          or (not p_deleted_only and (p_include_deleted or o.deleted_at is null)))
        and (p_channel is null or o.channel = p_channel)
        and (p_status is null or o.order_status = p_status)
        and (p_cashier is null or o.cashier = p_cashier)
        and (p_search is null or (
          o.customer_name ilike '%' || p_search || '%'
          or o.customer_phone ilike '%' || p_search || '%'
          or o.order_id ilike '%' || p_search || '%'
        ))
        order by o."timestamp" desc
        limit p_limit
        offset p_offset
      ) sub
    ), '[]'::json),
    'total', total_count
  ) into result;

  return result;
end;
$$;
