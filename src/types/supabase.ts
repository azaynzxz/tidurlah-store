/**
 * Supabase Database type definitions.
 * 
 * Maps all tables from migrations 001–004 to TypeScript types.
 * Used by: src/lib/supabase.ts → createClient<Database>()
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'cashier';
          avatar_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: 'admin' | 'cashier';
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'cashier';
          avatar_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          slug: string;
          image: string;
          additional_images: string[];
          description: string;
          price: number;
          discount_price: number | null;
          category: string;
          price_thresholds: Json;
          time: string;
          rating: number;
          bestseller: boolean;
          unit: string;
          is_available: boolean;
          pricing_method: 'dimensional' | null;
          base_price_per_sqm: number | null;
          min_width: number | null;
          max_width: number | null;
          min_height: number | null;
          max_height: number | null;
          models: Json;
          lamination_options: Json;
          is_customizable: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: number;
          name: string;
          slug: string;
          image?: string;
          additional_images?: string[];
          description?: string;
          price?: number;
          discount_price?: number | null;
          category: string;
          price_thresholds?: Json;
          time?: string;
          rating?: number;
          bestseller?: boolean;
          unit?: string;
          is_available?: boolean;
          pricing_method?: 'dimensional' | null;
          base_price_per_sqm?: number | null;
          min_width?: number | null;
          max_width?: number | null;
          min_height?: number | null;
          max_height?: number | null;
          models?: Json;
          lamination_options?: Json;
          is_customizable?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          image?: string;
          additional_images?: string[];
          description?: string;
          price?: number;
          discount_price?: number | null;
          category?: string;
          price_thresholds?: Json;
          time?: string;
          rating?: number;
          bestseller?: boolean;
          unit?: string;
          is_available?: boolean;
          pricing_method?: 'dimensional' | null;
          base_price_per_sqm?: number | null;
          min_width?: number | null;
          max_width?: number | null;
          min_height?: number | null;
          max_height?: number | null;
          models?: Json;
          lamination_options?: Json;
          is_customizable?: boolean;
          sort_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      promo_codes: {
        Row: {
          id: number;
          code: string;
          description: string;
          type: 'percentage' | 'override';
          discount_percent: number;
          product_ids: Json | null;
          min_quantity: number | null;
          override_prices: Json | null;
          is_active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          max_uses: number | null;
          current_uses: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          description?: string;
          type?: 'percentage' | 'override';
          discount_percent?: number;
          product_ids?: Json | null;
          min_quantity?: number | null;
          override_prices?: Json | null;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          description?: string;
          type?: 'percentage' | 'override';
          discount_percent?: number;
          product_ids?: Json | null;
          min_quantity?: number | null;
          override_prices?: Json | null;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_id: string;
          invoice_number: string | null;
          timestamp: string;
          channel: 'pos' | 'website' | 'migrated';
          cashier: string;
          cashier_user_id: string | null;
          customer_name: string;
          customer_phone: string;
          institution: string;
          subtotal: number;
          discount: number;
          total: number;
          down_payment: number;
          remaining_balance: number;
          payment_method: string;
          order_status: 'pending' | 'partial' | 'done' | 'cancelled';
          item_count: number;
          items_summary: string;
          promo_code: string;
          promo_discount: number;
          design_note: string;
          is_shipping: boolean;
          address: string;
          deadline: string | null;
          designer: string | null;
          has_jasa_desain: boolean;
          notes: string;
          deleted_at: string | null;
          deleted_by: string | null;
          cabang: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_id: string;
          invoice_number?: string | null;
          timestamp?: string;
          channel?: 'pos' | 'website' | 'migrated';
          cashier?: string;
          cashier_user_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          institution?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          down_payment?: number;
          remaining_balance?: number;
          payment_method?: string;
          order_status?: 'pending' | 'partial' | 'done' | 'cancelled';
          item_count?: number;
          items_summary?: string;
          promo_code?: string;
          promo_discount?: number;
          design_note?: string;
          is_shipping?: boolean;
          address?: string;
          deadline?: string | null;
          designer?: string | null;
          has_jasa_desain?: boolean;
          notes?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          cabang?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_id?: string;
          invoice_number?: string | null;
          timestamp?: string;
          channel?: 'pos' | 'website' | 'migrated';
          cashier?: string;
          cashier_user_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          institution?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          down_payment?: number;
          remaining_balance?: number;
          payment_method?: string;
          order_status?: 'pending' | 'partial' | 'done' | 'cancelled';
          item_count?: number;
          items_summary?: string;
          promo_code?: string;
          promo_discount?: number;
          design_note?: string;
          is_shipping?: boolean;
          address?: string;
          deadline?: string | null;
          designer?: string | null;
          has_jasa_desain?: boolean;
          notes?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          cabang?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: number | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          model_code: string;
          case_variant: string;
          lamination: string;
          width: number | null;
          height: number | null;
          dimension_text: string;
          area: string;
        };
        Insert: {
          order_id: string;
          product_id?: number | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          model_code?: string;
          case_variant?: string;
          lamination?: string;
          width?: number | null;
          height?: number | null;
          dimension_text?: string;
          area?: string;
        };
        Update: {
          order_id?: string;
          product_id?: number | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          model_code?: string;
          case_variant?: string;
          lamination?: string;
          width?: number | null;
          height?: number | null;
          dimension_text?: string;
          area?: string;
        };
        Relationships: [];
      };
      order_deliveries: {
        Row: {
          id: number;
          order_id: string;
          recipient_name: string;
          recipient_phone: string;
          address: string;
          ongkir: number;
          delivery_status: 'pending' | 'shipped' | 'delivered';
        };
        Insert: {
          order_id: string;
          recipient_name?: string;
          recipient_phone?: string;
          address?: string;
          ongkir?: number;
          delivery_status?: 'pending' | 'shipped' | 'delivered';
        };
        Update: {
          order_id?: string;
          recipient_name?: string;
          recipient_phone?: string;
          address?: string;
          ongkir?: number;
          delivery_status?: 'pending' | 'shipped' | 'delivered';
        };
        Relationships: [];
      };
      job_applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          position: string;
          cv_url: string | null;
          portfolio_url: string | null;
          info_source: string | null;
          address: string | null;
          motivation: string;
          experience: string | null;
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          full_name: string;
          email: string;
          phone: string;
          position: string;
          cv_url?: string | null;
          portfolio_url?: string | null;
          info_source?: string | null;
          address?: string | null;
          motivation?: string;
          experience?: string | null;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string;
          position?: string;
          cv_url?: string | null;
          portfolio_url?: string | null;
          info_source?: string | null;
          address?: string | null;
          motivation?: string;
          experience?: string | null;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          notes?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      survey_responses: {
        Row: {
          id: string;
          survey_type: string;
          respondent_name: string | null;
          respondent_email: string | null;
          responses: Json;
          created_at: string;
        };
        Insert: {
          survey_type?: string;
          respondent_name?: string | null;
          respondent_email?: string | null;
          responses?: Json;
          created_at?: string;
        };
        Update: {
          survey_type?: string;
          respondent_name?: string | null;
          respondent_email?: string | null;
          responses?: Json;
        };
        Relationships: [];
      };
      production_tasks: {
        Row: {
          id: string;
          schedule_date: string;
          order_id: string | null;
          title: string;
          description: string;
          priority: number;
          is_completed: boolean;
          sort_order: number;
          created_by: string;
          deadline: string | null;
          customer_name: string;
          items_summary: string;
          cabang: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          schedule_date: string;
          order_id?: string | null;
          title: string;
          description?: string;
          priority?: number;
          is_completed?: boolean;
          sort_order?: number;
          created_by?: string;
          deadline?: string | null;
          customer_name?: string;
          items_summary?: string;
          cabang?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          schedule_date?: string;
          order_id?: string | null;
          title?: string;
          description?: string;
          priority?: number;
          is_completed?: boolean;
          sort_order?: number;
          created_by?: string;
          deadline?: string | null;
          customer_name?: string;
          items_summary?: string;
          cabang?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_invoice_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_orders: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_channel?: string | null;
          p_status?: string | null;
          p_cashier?: string | null;
          p_search?: string | null;
          p_include_deleted?: boolean;
          p_deleted_only?: boolean;
        };
        Returns: Json;
      };
      get_dashboard_data: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_monthly_report: {
        Args: {
          p_month: number;
          p_year: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type PromoCode = Database['public']['Tables']['promo_codes']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderDelivery = Database['public']['Tables']['order_deliveries']['Row'];
export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'];
export type ProductionTask = Database['public']['Tables']['production_tasks']['Row'];

// Insert types
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderDeliveryInsert = Database['public']['Tables']['order_deliveries']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
export type ProductionTaskInsert = Database['public']['Tables']['production_tasks']['Insert'];
