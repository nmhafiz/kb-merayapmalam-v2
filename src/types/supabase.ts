export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          admin_chat_id: number
          command: string
          executed_at: string | null
          id: string
          payload: Json | null
        }
        Insert: {
          admin_chat_id: number
          command: string
          executed_at?: string | null
          id?: string
          payload?: Json | null
        }
        Update: {
          admin_chat_id?: number
          command?: string
          executed_at?: string | null
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          email_type: string
          id: string
          mailersend_message_id: string | null
          order_id: string | null
          recipient: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_type: string
          id?: string
          mailersend_message_id?: string | null
          order_id?: string | null
          recipient: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string
          id?: string
          mailersend_message_id?: string | null
          order_id?: string | null
          recipient?: string
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_images: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          billplz_category_code: string | null
          billplz_collection_id: string | null
          certificate_orientation: string | null
          certificate_settings: Json | null
          certificate_template_url: string | null
          city: string
          created_at: string | null
          date_time: string
          delivery_type: string | null
          description: string | null
          event_type: string | null
          form_fields: Json | null
          guide_url: string | null
          has_online_registration: boolean | null
          hero_subtitle: string | null
          highlights: Json | null
          id: string
          images: Json | null
          is_paid_event: boolean | null
          name: string
          organizer_id: string
          postage_settings: Json | null
          race_category: string | null
          registration_close_date: string | null
          repc_end_datetime: string | null
          repc_location: string | null
          repc_settings: Json | null
          repc_start_datetime: string | null
          short_description: string | null
          show_sponsors: boolean | null
          slug: string
          sponsors: Json | null
          state: string
          status: string | null
          updated_at: string | null
          venue: string | null
          video_url: string | null
          waze_link: string | null
        }
        Insert: {
          banner_url?: string | null
          billplz_category_code?: string | null
          billplz_collection_id?: string | null
          certificate_orientation?: string | null
          certificate_settings?: Json | null
          certificate_template_url?: string | null
          city: string
          created_at?: string | null
          date_time: string
          delivery_type?: string | null
          description?: string | null
          event_type?: string | null
          form_fields?: Json | null
          guide_url?: string | null
          has_online_registration?: boolean | null
          hero_subtitle?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          is_paid_event?: boolean | null
          name: string
          organizer_id: string
          postage_settings?: Json | null
          race_category?: string | null
          registration_close_date?: string | null
          repc_end_datetime?: string | null
          repc_location?: string | null
          repc_settings?: Json | null
          repc_start_datetime?: string | null
          short_description?: string | null
          show_sponsors?: boolean | null
          slug: string
          sponsors?: Json | null
          state: string
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          video_url?: string | null
          waze_link?: string | null
        }
        Update: {
          banner_url?: string | null
          billplz_category_code?: string | null
          billplz_collection_id?: string | null
          certificate_orientation?: string | null
          certificate_settings?: Json | null
          certificate_template_url?: string | null
          city?: string
          created_at?: string | null
          date_time?: string
          delivery_type?: string | null
          description?: string | null
          event_type?: string | null
          form_fields?: Json | null
          guide_url?: string | null
          has_online_registration?: boolean | null
          hero_subtitle?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          is_paid_event?: boolean | null
          name?: string
          organizer_id?: string
          postage_settings?: Json | null
          race_category?: string | null
          registration_close_date?: string | null
          repc_end_datetime?: string | null
          repc_location?: string | null
          repc_settings?: Json | null
          repc_start_datetime?: string | null
          short_description?: string | null
          show_sponsors?: boolean | null
          slug?: string
          sponsors?: Json | null
          state?: string
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          video_url?: string | null
          waze_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          display_order: number | null
          event_id: string
          id: string
          question: string
        }
        Insert: {
          answer: string
          display_order?: number | null
          event_id: string
          id?: string
          question: string
        }
        Update: {
          answer?: string
          display_order?: number | null
          event_id?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "kb_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "kb_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "kb_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          is_cancelled: boolean | null
          location_map_url: string | null
          location_name: string
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          is_cancelled?: boolean | null
          location_map_url?: string | null
          location_name: string
          time: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          is_cancelled?: boolean | null
          location_map_url?: string | null
          location_name?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      kb_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "kb_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "kb_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "kb_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          handle: string
          id: string
          nickname: string
          phone: string | null
          role: string | null
          badges: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          handle: string
          id: string
          nickname: string
          phone?: string | null
          role?: string | null
          badges?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          handle?: string
          id?: string
          nickname?: string
          phone?: string | null
          role?: string | null
          badges?: string[] | null
        }
        Relationships: []
      }
      kb_polls: {
        Row: {
          id: string
          created_at: string
          created_by: string
          question: string
          is_active: boolean
          expires_at: string | null
          event_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by?: string
          question: string
          is_active?: boolean
          expires_at?: string | null
          event_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          question?: string
          is_active?: boolean
          expires_at?: string | null
          event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_polls_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          votes: number
          sort_order: number
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          votes?: number
          sort_order?: number
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          votes?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "kb_polls"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_poll_votes: {
        Row: {
          id: string
          created_at: string
          poll_id: string
          option_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          poll_id: string
          option_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          poll_id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "kb_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "kb_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_checkins: {
        Row: {
          id: string
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_potluck_items: {
        Row: {
          id: string
          event_id: string
          name: string
          category: string
          quantity_required: number
          is_suggested: boolean
          description: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          category: string
          quantity_required?: number
          is_suggested?: boolean
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          category?: string
          quantity_required?: number
          is_suggested?: boolean
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_potluck_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_potluck_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_potluck_claims: {
        Row: {
          id: string
          item_id: string
          user_id: string
          quantity_promised: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          quantity_promised?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          quantity_promised?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_potluck_claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "kb_potluck_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_potluck_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_routes: {
        Row: {
          id: string
          title: string
          distance_km: number
          difficulty: string
          description: string | null
          map_url: string | null
          start_point: string | null
          preview_url: string | null
          strava_url: string | null
          is_vetted: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          distance_km: number
          difficulty: string
          description?: string | null
          map_url?: string | null
          start_point?: string | null
          preview_url?: string | null
          is_vetted?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          distance_km?: number
          difficulty?: string
          description?: string | null
          map_url?: string | null
          start_point?: string | null
          preview_url?: string | null
          is_vetted?: boolean
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_announcements: {
        Row: {
          id: string
          title: string
          content: string
          is_pinned: boolean
          is_urgent: boolean
          scheduled_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          is_pinned?: boolean
          is_urgent?: boolean
          scheduled_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          is_urgent?: boolean
          scheduled_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_sponsors: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kb_event_sponsors: {
        Row: {
          id: string
          event_id: string
          sponsor_id: string
          tier: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          sponsor_id: string
          tier?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          sponsor_id?: string
          tier?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_event_sponsors_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "kb_sponsors"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_event_photos: {
        Row: {
          id: string
          event_id: string
          url: string
          caption: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          url: string
          caption?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          url?: string
          caption?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "kb_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_event_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      kb_push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_json: Json
          device_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_json: Json
          device_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_json?: Json
          device_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_status: string | null
          old_status: string | null
          order_id: string | null
        }
        Insert: {
          actor?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Update: {
          actor?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total_cents: number
          order_id: string | null
          price_cents_snapshot: number
          product_id: string | null
          qty: number
          title_snapshot: string
        }
        Insert: {
          id?: string
          line_total_cents: number
          order_id?: string | null
          price_cents_snapshot: number
          product_id?: string | null
          qty: number
          title_snapshot: string
        }
        Update: {
          id?: string
          line_total_cents?: number
          order_id?: string | null
          price_cents_snapshot?: number
          product_id?: string | null
          qty?: number
          title_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bayarcash_payment_intent_id: string | null
          created_at: string | null
          expired_at: string | null
          expires_at: string | null
          id: string
          order_number: string
          paid_at: string | null
          payer_email: string
          payer_name: string
          payer_phone_e164: string | null
          payer_phone_msisdn: string | null
          payment_channel: string | null
          payment_channel_label: string | null
          refund_amount_cents: number | null
          refund_reason: string | null
          refunded_at: string | null
          shipping_cents: number
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Insert: {
          bayarcash_payment_intent_id?: string | null
          created_at?: string | null
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payer_email: string
          payer_name: string
          payer_phone_e164?: string | null
          payer_phone_msisdn?: string | null
          payment_channel?: string | null
          payment_channel_label?: string | null
          refund_amount_cents?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          shipping_cents?: number
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Update: {
          bayarcash_payment_intent_id?: string | null
          created_at?: string | null
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payer_email?: string
          payer_name?: string
          payer_phone_e164?: string | null
          payer_phone_msisdn?: string | null
          payment_channel?: string | null
          payment_channel_label?: string | null
          refund_amount_cents?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Relationships: []
      }
      packages: {
        Row: {
          apparel_sizes: string[] | null
          apparel_types: string[] | null
          config: Json | null
          description: string | null
          early_bird_deadline: string | null
          early_bird_quota: number | null
          event_id: string
          has_apparel: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price_early_bird: number | null
          price_normal: number
          remaining_quota: number
          size_chart_urls: string[] | null
          total_quota: number
        }
        Insert: {
          apparel_sizes?: string[] | null
          apparel_types?: string[] | null
          config?: Json | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_quota?: number | null
          event_id: string
          has_apparel?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price_early_bird?: number | null
          price_normal: number
          remaining_quota: number
          size_chart_urls?: string[] | null
          total_quota: number
        }
        Update: {
          apparel_sizes?: string[] | null
          apparel_types?: string[] | null
          config?: Json | null
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_quota?: number | null
          event_id?: string
          has_apparel?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price_early_bird?: number | null
          price_normal?: number
          remaining_quota?: number
          size_chart_urls?: string[] | null
          total_quota?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          images: Json
          is_available: boolean | null
          price_cents: number
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          images?: Json
          is_available?: boolean | null
          price_cents: number
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          images?: Json
          is_available?: boolean | null
          price_cents?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      puc_check_ins: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          id: string
          notes: string | null
          participant_index: number
          participant_name: string
          registration_id: string
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          id?: string
          notes?: string | null
          participant_index: number
          participant_name: string
          registration_id: string
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          id?: string
          notes?: string | null
          participant_index?: number
          participant_name?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puc_check_ins_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "puc_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      puc_registrations: {
        Row: {
          add_ons: Json | null
          add_ons_collected: boolean | null
          address_line1: string
          address_line2: string | null
          agent_name: string | null
          billplz_bill_id: string | null
          billplz_payload: Json | null
          billplz_url: string | null
          checked_in: boolean | null
          checked_in_at: string | null
          checked_in_by: string | null
          city: string
          created_at: string | null
          email: string
          emergency_name: string
          emergency_phone: string
          emergency_relationship: string
          full_name: string
          ic_number: string
          id: string
          lucky_draw_extra: number | null
          paid_at: string | null
          participants: Json
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          phone: string
          postcode: string
          qr_code: string | null
          state: string
          total_amount: number
          updated_at: string | null
          voucher_rm5: number | null
          searchable_text: string | null
        }
        Insert: {
          add_ons?: Json | null
          add_ons_collected?: boolean | null
          address_line1: string
          address_line2?: string | null
          agent_name?: string | null
          billplz_bill_id?: string | null
          billplz_payload?: Json | null
          billplz_url?: string | null
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          city: string
          created_at?: string | null
          email: string
          emergency_name: string
          emergency_phone: string
          emergency_relationship: string
          full_name: string
          ic_number: string
          id?: string
          lucky_draw_extra?: number | null
          paid_at?: string | null
          participants?: Json
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone: string
          postcode: string
          qr_code?: string | null
          state: string
          total_amount: number
          updated_at?: string | null
          voucher_rm5?: number | null
        }
        Update: {
          add_ons?: Json | null
          add_ons_collected?: boolean | null
          address_line1?: string
          address_line2?: string | null
          agent_name?: string | null
          billplz_bill_id?: string | null
          billplz_payload?: Json | null
          billplz_url?: string | null
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          city?: string
          created_at?: string | null
          email?: string
          emergency_name?: string
          emergency_phone?: string
          emergency_relationship?: string
          full_name?: string
          ic_number?: string
          id?: string
          lucky_draw_extra?: number | null
          paid_at?: string | null
          participants?: Json
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          postcode?: string
          qr_code?: string | null
          state?: string
          total_amount?: number
          updated_at?: string | null
          voucher_rm5?: number | null
        }
        Relationships: []
      }
      qadasolat_orders: {
        Row: {
          amount: number
          bill_id: string
          bizapp_order_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          payment_metadata: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          bizapp_order_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          payment_metadata?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          bizapp_order_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          payment_metadata?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          expires_at: number
          hits: number | null
          key: string
        }
        Insert: {
          expires_at: number
          hits?: number | null
          key: string
        }
        Update: {
          expires_at?: number
          hits?: number | null
          key?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string
          amount: number
          bib_number: string | null
          billplz_bill_id: string | null
          billplz_paid_at: string | null
          city: string
          created_at: string | null
          custom_answers: Json | null
          delivery_type: string
          email: string
          event_id: string
          ic_or_id: string | null
          id: string
          kit_collected: boolean | null
          package_id: string | null
          participant_name: string
          payment_status: string | null
          phone: string
          postcode: string
          state: string
          status: string | null
          tshirt_size: string
        }
        Insert: {
          address: string
          amount: number
          bib_number?: string | null
          billplz_bill_id?: string | null
          billplz_paid_at?: string | null
          city: string
          created_at?: string | null
          custom_answers?: Json | null
          delivery_type: string
          email: string
          event_id: string
          ic_or_id?: string | null
          id?: string
          kit_collected?: boolean | null
          package_id?: string | null
          participant_name: string
          payment_status?: string | null
          phone: string
          postcode: string
          state: string
          status?: string | null
          tshirt_size: string
        }
        Update: {
          address?: string
          amount?: number
          bib_number?: string | null
          billplz_bill_id?: string | null
          billplz_paid_at?: string | null
          city?: string
          created_at?: string | null
          custom_answers?: Json | null
          delivery_type?: string
          email?: string
          event_id?: string
          ic_or_id?: string | null
          id?: string
          kit_collected?: boolean | null
          package_id?: string | null
          participant_name?: string
          payment_status?: string | null
          phone?: string
          postcode?: string
          state?: string
          status?: string | null
          tshirt_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bill_id: string
          bill_url: string | null
          created_at: string | null
          description: string | null
          id: string
          registration_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          bill_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          registration_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          bill_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          registration_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billplz_email: string | null
          billplz_verified_at: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_super_admin: boolean | null
          name: string
          password_hash: string
          phone_number: string | null
          plan_type: string
          platform_fee_percent: number | null
          reset_token: string | null
          reset_token_expiry: string | null
          role: string | null
          updated_at: string | null
          verification_token: string | null
        }
        Insert: {
          avatar_url?: string | null
          billplz_email?: string | null
          billplz_verified_at?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_super_admin?: boolean | null
          name: string
          password_hash: string
          phone_number?: string | null
          plan_type?: string
          platform_fee_percent?: number | null
          reset_token?: string | null
          reset_token_expiry?: string | null
          role?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Update: {
          avatar_url?: string | null
          billplz_email?: string | null
          billplz_verified_at?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_super_admin?: boolean | null
          name?: string
          password_hash?: string
          phone_number?: string | null
          plan_type?: string
          platform_fee_percent?: number | null
          reset_token?: string | null
          reset_token_expiry?: string | null
          role?: string | null
          updated_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_package_quota: {
        Args: { package_id: string }
        Returns: undefined
      }
      get_total_participants: { Args: never; Returns: number }
      searchable_text: {
        Args: { "": Database["public"]["Tables"]["puc_registrations"]["Row"] }
        Returns: {
          error: true
        } & "the function public.searchable_text with parameter or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache"
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
