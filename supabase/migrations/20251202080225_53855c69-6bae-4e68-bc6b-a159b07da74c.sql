-- Enable full replica identity for realtime support
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.deliveries REPLICA IDENTITY FULL;
ALTER TABLE public.priority_routes REPLICA IDENTITY FULL;