


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_package_quota"("package_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE packages
  SET remaining_quota = remaining_quota - 1
  WHERE id = package_id
    AND remaining_quota > 0;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found or quota exhausted';
  END IF;
END;
$$;


ALTER FUNCTION "public"."decrement_package_quota"("package_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_total_participants"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
declare
  total integer;
begin
  select coalesce(sum(jsonb_array_length(participants)), 0)
  into total
  from puc_registrations
  where payment_status = 'paid';
  
  return total;
end;
$$;


ALTER FUNCTION "public"."get_total_participants"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."puc_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "ic_number" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postcode" "text" NOT NULL,
    "emergency_name" "text" NOT NULL,
    "emergency_phone" "text" NOT NULL,
    "emergency_relationship" "text" NOT NULL,
    "participants" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "voucher_rm5" integer DEFAULT 0,
    "lucky_draw_extra" integer DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "payment_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_method" "text",
    "payment_reference" "text",
    "billplz_bill_id" "text",
    "billplz_url" "text",
    "paid_at" timestamp with time zone,
    "qr_code" "text",
    "checked_in" boolean DEFAULT false,
    "checked_in_at" timestamp with time zone,
    "checked_in_by" "text",
    "add_ons" "jsonb" DEFAULT '[]'::"jsonb",
    "add_ons_collected" boolean DEFAULT false,
    "billplz_payload" "jsonb",
    "agent_name" "text",
    CONSTRAINT "puc_registrations_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['online'::"text", 'cash'::"text", 'manual'::"text", 'offline'::"text"]))),
    CONSTRAINT "puc_registrations_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."puc_registrations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."puc_registrations"."payment_method" IS 'online, cash, manual, offline';



COMMENT ON COLUMN "public"."puc_registrations"."agent_name" IS 'Name of the staff/agent who handled the offline registration';



CREATE OR REPLACE FUNCTION "public"."searchable_text"("public"."puc_registrations") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  SELECT $1.participants::text;
$_$;


ALTER FUNCTION "public"."searchable_text"("public"."puc_registrations") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_chat_id" bigint NOT NULL,
    "command" "text" NOT NULL,
    "payload" "jsonb",
    "executed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "key" "text" NOT NULL,
    "value" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "email_type" "text" NOT NULL,
    "recipient" "text" NOT NULL,
    "template_id" "text",
    "mailersend_message_id" "text",
    "status" "text" DEFAULT 'sent'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "short_description" "text",
    "description" "text",
    "state" "text" NOT NULL,
    "city" "text" NOT NULL,
    "date_time" timestamp with time zone NOT NULL,
    "registration_close_date" timestamp with time zone,
    "banner_url" "text",
    "is_paid_event" boolean DEFAULT false,
    "has_online_registration" boolean DEFAULT false,
    "delivery_type" "text" DEFAULT 'PICKUP'::"text",
    "billplz_collection_id" "text",
    "status" "text" DEFAULT 'DRAFT'::"text",
    "hero_subtitle" "text",
    "highlights" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "repc_location" "text",
    "repc_start_datetime" timestamp with time zone,
    "repc_end_datetime" timestamp with time zone,
    "images" "jsonb" DEFAULT '[]'::"jsonb",
    "billplz_category_code" "text",
    "certificate_template_url" "text",
    "certificate_orientation" "text" DEFAULT 'LANDSCAPE'::"text",
    "certificate_settings" "jsonb",
    "event_type" "text",
    "waze_link" "text",
    "venue" "text",
    "video_url" "text",
    "form_fields" "jsonb" DEFAULT '[]'::"jsonb",
    "postage_settings" "jsonb",
    "repc_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "sponsors" "jsonb" DEFAULT '[]'::"jsonb",
    "show_sponsors" boolean DEFAULT true,
    "race_category" "text" DEFAULT 'FUN_RUN'::"text",
    "guide_url" "text",
    CONSTRAINT "events_delivery_type_check" CHECK (("delivery_type" = ANY (ARRAY['PICKUP'::"text", 'POSTAGE'::"text", 'BOTH'::"text"]))),
    CONSTRAINT "events_event_type_check" CHECK (("event_type" = ANY (ARRAY['PHYSICAL'::"text", 'VIRTUAL'::"text"]))),
    CONSTRAINT "events_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'PUBLISHED'::"text", 'CLOSED'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    CONSTRAINT "newsletter_subscribers_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'unsubscribed'::"text"])))
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "event_type" "text" NOT NULL,
    "old_status" "text",
    "new_status" "text",
    "actor" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "title_snapshot" "text" NOT NULL,
    "price_cents_snapshot" integer NOT NULL,
    "qty" integer NOT NULL,
    "line_total_cents" integer NOT NULL,
    CONSTRAINT "order_items_qty_check" CHECK (("qty" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_number" "text" NOT NULL,
    "status" "text" NOT NULL,
    "payment_channel" "text",
    "payment_channel_label" "text",
    "subtotal_cents" integer NOT NULL,
    "shipping_cents" integer DEFAULT 0 NOT NULL,
    "total_cents" integer NOT NULL,
    "payer_name" "text" NOT NULL,
    "payer_email" "text" NOT NULL,
    "payer_phone_msisdn" "text",
    "payer_phone_e164" "text",
    "bayarcash_payment_intent_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "expired_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "refunded_at" timestamp with time zone,
    "refund_reason" "text",
    "refund_amount_cents" integer,
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['PENDING_PAYMENT'::"text", 'PAID'::"text", 'PURCHASED'::"text", 'SHIPPED'::"text", 'COMPLETED'::"text", 'EXPIRED'::"text", 'FAILED'::"text", 'CANCELLED'::"text", 'REFUNDED'::"text", 'PARTIAL_REFUND'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_normal" numeric(10,2) NOT NULL,
    "price_early_bird" numeric(10,2),
    "early_bird_quota" integer,
    "total_quota" integer NOT NULL,
    "remaining_quota" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "early_bird_deadline" timestamp with time zone,
    "has_apparel" boolean DEFAULT false,
    "apparel_sizes" "text"[] DEFAULT '{}'::"text"[],
    "apparel_types" "text"[] DEFAULT '{}'::"text"[],
    "size_chart_urls" "text"[] DEFAULT '{}'::"text"[],
    "config" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."packages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "price_cents" integer NOT NULL,
    "currency" "text" DEFAULT 'MYR'::"text",
    "images" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "is_available" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "products_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'live'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."puc_check_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registration_id" "uuid" NOT NULL,
    "participant_index" integer NOT NULL,
    "participant_name" "text" NOT NULL,
    "checked_in_at" timestamp with time zone DEFAULT "now"(),
    "checked_in_by" "text",
    "notes" "text"
);


ALTER TABLE "public"."puc_check_ins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qadasolat_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bill_id" "text" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_phone" "text" NOT NULL,
    "customer_email" "text",
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "bizapp_order_id" "text",
    "payment_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."qadasolat_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "key" "text" NOT NULL,
    "hits" integer DEFAULT 1,
    "expires_at" bigint NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "package_id" "uuid",
    "participant_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "ic_or_id" "text",
    "address" "text" NOT NULL,
    "postcode" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "tshirt_size" "text" NOT NULL,
    "delivery_type" "text" NOT NULL,
    "payment_status" "text" DEFAULT 'PENDING'::"text",
    "billplz_bill_id" "text",
    "billplz_paid_at" timestamp with time zone,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bib_number" "text",
    "kit_collected" boolean DEFAULT false,
    "status" "text" DEFAULT 'PENDING'::"text",
    "custom_answers" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "registrations_delivery_type_check" CHECK (("delivery_type" = ANY (ARRAY['PICKUP'::"text", 'POSTAGE'::"text"]))),
    CONSTRAINT "registrations_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['PENDING'::"text", 'PAID'::"text", 'FAILED'::"text", 'CANCELLED'::"text"])))
);


ALTER TABLE "public"."registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registration_id" "uuid",
    "bill_id" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text",
    "description" "text",
    "bill_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "name" "text" NOT NULL,
    "plan_type" "text" DEFAULT 'FREE'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email_verified" boolean DEFAULT false,
    "verification_token" "text",
    "reset_token" "text",
    "reset_token_expiry" timestamp with time zone,
    "is_super_admin" boolean DEFAULT false,
    "billplz_email" "text",
    "billplz_verified_at" timestamp with time zone,
    "platform_fee_percent" numeric DEFAULT 5.0,
    "role" "text" DEFAULT 'organizer'::"text",
    "phone_number" "text",
    "avatar_url" "text",
    CONSTRAINT "users_plan_type_check" CHECK (("plan_type" = ANY (ARRAY['FREE'::"text", 'PAID'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_images"
    ADD CONSTRAINT "event_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."puc_check_ins"
    ADD CONSTRAINT "puc_check_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."puc_check_ins"
    ADD CONSTRAINT "puc_check_ins_registration_id_participant_index_key" UNIQUE ("registration_id", "participant_index");



ALTER TABLE ONLY "public"."puc_registrations"
    ADD CONSTRAINT "puc_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."puc_registrations"
    ADD CONSTRAINT "puc_registrations_qr_code_key" UNIQUE ("qr_code");



ALTER TABLE ONLY "public"."qadasolat_orders"
    ADD CONSTRAINT "qadasolat_orders_bill_id_key" UNIQUE ("bill_id");



ALTER TABLE ONLY "public"."qadasolat_orders"
    ADD CONSTRAINT "qadasolat_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."registrations"
    ADD CONSTRAINT "registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_event_images_event" ON "public"."event_images" USING "btree" ("event_id");



CREATE INDEX "idx_event_images_sort" ON "public"."event_images" USING "btree" ("event_id", "sort_order");



CREATE INDEX "idx_events_organizer" ON "public"."events" USING "btree" ("organizer_id");



CREATE INDEX "idx_events_status" ON "public"."events" USING "btree" ("status");



CREATE INDEX "idx_faqs_event" ON "public"."faqs" USING "btree" ("event_id");



CREATE INDEX "idx_order_events_order_id" ON "public"."order_events" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at");



CREATE INDEX "idx_orders_order_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_payment_intent" ON "public"."orders" USING "btree" ("bayarcash_payment_intent_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_packages_event" ON "public"."packages" USING "btree" ("event_id");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("status");



CREATE INDEX "idx_puc_check_ins_checked_in_at" ON "public"."puc_check_ins" USING "btree" ("checked_in_at" DESC);



CREATE INDEX "idx_puc_check_ins_registration_id" ON "public"."puc_check_ins" USING "btree" ("registration_id");



CREATE INDEX "idx_puc_registrations_created_at" ON "public"."puc_registrations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_puc_registrations_email" ON "public"."puc_registrations" USING "btree" ("email");



CREATE INDEX "idx_puc_registrations_payment_status" ON "public"."puc_registrations" USING "btree" ("payment_status");



CREATE INDEX "idx_puc_registrations_qr_code" ON "public"."puc_registrations" USING "btree" ("qr_code");



CREATE INDEX "idx_rate_limits_expires_at" ON "public"."rate_limits" USING "btree" ("expires_at");



CREATE INDEX "idx_registrations_email" ON "public"."registrations" USING "btree" ("email");



CREATE INDEX "idx_registrations_event" ON "public"."registrations" USING "btree" ("event_id");



CREATE INDEX "idx_registrations_payment_status" ON "public"."registrations" USING "btree" ("payment_status");



CREATE INDEX "idx_transactions_bill_id" ON "public"."transactions" USING "btree" ("bill_id");



CREATE INDEX "idx_transactions_registration_id" ON "public"."transactions" USING "btree" ("registration_id");



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "update_puc_registrations_updated_at" BEFORE UPDATE ON "public"."puc_registrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."event_images"
    ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."puc_check_ins"
    ADD CONSTRAINT "puc_check_ins_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."puc_registrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registrations"
    ADD CONSTRAINT "registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registrations"
    ADD CONSTRAINT "registrations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE CASCADE;



CREATE POLICY "Admin Manage Settings" ON "public"."admin_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'SUPER_ADMIN'::"text")))));



CREATE POLICY "Allow admin read" ON "public"."newsletter_subscribers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public access to rate_limits" ON "public"."rate_limits" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public insert" ON "public"."newsletter_subscribers" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create registrations" ON "public"."puc_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create registrations" ON "public"."registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view FAQs for published events" ON "public"."faqs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND (("events"."status" = 'PUBLISHED'::"text") OR ("events"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Anyone can view packages for published events" ON "public"."packages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND (("events"."status" = 'PUBLISHED'::"text") OR ("events"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Anyone can view published events" ON "public"."events" FOR SELECT USING ((("status" = 'PUBLISHED'::"text") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Enable read/write for anon" ON "public"."rate_limits" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Event organizers can update registrations for their events" ON "public"."registrations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "registrations"."event_id") AND ("events"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "registrations"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Event organizers can view registrations for their events" ON "public"."registrations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "registrations"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can create events" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can delete FAQs for own events" ON "public"."faqs" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can delete images" ON "public"."event_images" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_images"."event_id") AND ("e"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can delete own events" ON "public"."events" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can delete packages for own events" ON "public"."packages" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can insert FAQs for own events" ON "public"."faqs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can insert images" ON "public"."event_images" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_images"."event_id") AND ("e"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can insert packages for own events" ON "public"."packages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can manage FAQs for own events" ON "public"."faqs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can manage packages for own events" ON "public"."packages" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can update FAQs for own events" ON "public"."faqs" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "faqs"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can update images" ON "public"."event_images" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_images"."event_id") AND ("e"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_images"."event_id") AND ("e"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can update own events" ON "public"."events" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "organizer_id")) WITH CHECK (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can update packages for own events" ON "public"."packages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "packages"."event_id") AND ("events"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can view transactions for their events" ON "public"."transactions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."registrations" "r"
     JOIN "public"."events" "e" ON (("r"."event_id" = "e"."id")))
  WHERE (("r"."id" = "transactions"."registration_id") AND ("e"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Public Read Settings" ON "public"."admin_settings" FOR SELECT USING (true);



CREATE POLICY "Public can read live products" ON "public"."products" FOR SELECT TO "authenticated", "anon" USING (("status" = 'live'::"text"));



CREATE POLICY "Public can view images for published events" ON "public"."event_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_images"."event_id") AND (("e"."status" = 'PUBLISHED'::"text") OR ("e"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Service Role can do all" ON "public"."qadasolat_orders" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage check-ins" ON "public"."puc_check_ins" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update registrations" ON "public"."puc_registrations" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can read own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read their own registrations" ON "public"."puc_registrations" FOR SELECT USING (true);



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own transactions" ON "public"."transactions" FOR SELECT USING (("auth"."uid"() IN ( SELECT "events"."organizer_id"
   FROM ("public"."events"
     JOIN "public"."registrations" ON (("events"."id" = "registrations"."event_id")))
  WHERE ("registrations"."id" = "transactions"."registration_id"))));



ALTER TABLE "public"."admin_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."packages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."puc_check_ins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."puc_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qadasolat_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."decrement_package_quota"("package_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_package_quota"("package_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_package_quota"("package_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_total_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_total_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_total_participants"() TO "service_role";



GRANT ALL ON TABLE "public"."puc_registrations" TO "anon";
GRANT ALL ON TABLE "public"."puc_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."puc_registrations" TO "service_role";



GRANT ALL ON FUNCTION "public"."searchable_text"("public"."puc_registrations") TO "anon";
GRANT ALL ON FUNCTION "public"."searchable_text"("public"."puc_registrations") TO "authenticated";
GRANT ALL ON FUNCTION "public"."searchable_text"("public"."puc_registrations") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."admin_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_settings" TO "anon";
GRANT ALL ON TABLE "public"."admin_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_settings" TO "service_role";



GRANT ALL ON TABLE "public"."email_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_logs" TO "service_role";



GRANT ALL ON TABLE "public"."event_images" TO "anon";
GRANT ALL ON TABLE "public"."event_images" TO "authenticated";
GRANT ALL ON TABLE "public"."event_images" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."faqs" TO "anon";
GRANT ALL ON TABLE "public"."faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."faqs" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."order_events" TO "anon";
GRANT ALL ON TABLE "public"."order_events" TO "authenticated";
GRANT ALL ON TABLE "public"."order_events" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."packages" TO "anon";
GRANT ALL ON TABLE "public"."packages" TO "authenticated";
GRANT ALL ON TABLE "public"."packages" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."puc_check_ins" TO "anon";
GRANT ALL ON TABLE "public"."puc_check_ins" TO "authenticated";
GRANT ALL ON TABLE "public"."puc_check_ins" TO "service_role";



GRANT ALL ON TABLE "public"."qadasolat_orders" TO "anon";
GRANT ALL ON TABLE "public"."qadasolat_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."qadasolat_orders" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."registrations" TO "anon";
GRANT ALL ON TABLE "public"."registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."registrations" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































