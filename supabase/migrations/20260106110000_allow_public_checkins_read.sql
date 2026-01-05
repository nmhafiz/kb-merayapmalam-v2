-- Allow public read for check-ins to show attendee counts
CREATE POLICY "Public can view checkin counts" ON public.kb_checkins FOR SELECT TO public USING (true);
