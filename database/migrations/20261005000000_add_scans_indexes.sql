-- Add performance indexes for scans and scan items foreign keys
CREATE INDEX IF NOT EXISTS idx_scans_profile_id ON public.scans(profile_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_items_scan_id ON public.scan_items(scan_id);
