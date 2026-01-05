-- Create Founder Admin User: Khairur Rijal Pauzi
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_email TEXT := 'kbkearongrunner@gmail.com';
    v_password TEXT := 'Mamatok';
    v_handle TEXT := 'khairurrijalpauzi';
    v_nickname TEXT := 'Khairur Rijal Pauzi'; -- Using full name as nickname for now
    v_phone TEXT := '0169211115';
BEGIN
    -- 1. Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        -- Generate new ID
        v_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            instance_id
        ) VALUES (
            v_user_id,
            v_email,
            crypt(v_password, gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('username', v_handle, 'full_name', v_nickname, 'phone', v_phone),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            '00000000-0000-0000-0000-000000000000'
        );
    ELSE
        -- Update password if user exists
        UPDATE auth.users 
        SET encrypted_password = crypt(v_password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object('username', v_handle, 'full_name', v_nickname, 'phone', v_phone)
        WHERE id = v_user_id;
    END IF;

    -- 2. Insert/Update public.kb_profiles (Admin Role)
    -- Ensure handles conflicts gracefully
    INSERT INTO public.kb_profiles (id, handle, nickname, phone, role)
    VALUES (v_user_id, v_handle, v_nickname, v_phone, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        handle = EXCLUDED.handle,
        nickname = EXCLUDED.nickname,
        phone = EXCLUDED.phone;

END $$;
